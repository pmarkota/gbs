import { NextResponse } from "next/server";
import { signUp } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";

// Define an error interface for better typing
interface AuthError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  stack?: string;
}

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validate inputs
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    console.log("Starting registration for user:", username);

    // Register user with Supabase
    const data = await signUp(email, password, username);

    console.log("User authentication created successfully:", data.user?.id);

    // Generate JWT token for automatic login after registration
    const user = {
      id: data.user?.id || "",
      email: email,
      username: username,
    };

    const token = generateToken(user);

    console.log("Registration successful, JWT token generated");

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
        token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const authError = error as AuthError;
    console.error("Registration error details:", {
      message: authError.message,
      code: authError.code,
      details: authError.details,
      hint: authError.hint,
      stack: authError.stack,
    });

    // Handle specific error cases
    if (authError.message.includes("already registered")) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: authError.message || "Registration failed" },
      { status: 500 }
    );
  }
}
