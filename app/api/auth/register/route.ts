import { NextResponse } from "next/server";
import { signUp } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";

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
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    });

    // Handle specific error cases
    if (error.message.includes("already registered")) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
