import { NextResponse } from "next/server";
import { signIn } from "@/lib/supabase";
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
    const { username, password } = await request.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    console.log("Attempting login for user:", username);

    // Login with Supabase
    const data = await signIn(username, password);

    console.log("Login authentication successful for user:", data.user?.id);

    // Generate JWT token
    const user = {
      id: data.user?.id || "",
      email: data.user?.email || "",
      username: data.user?.user_metadata?.username || username,
      role: data.user?.user_metadata?.role || "user",
      rank: data.user?.user_metadata?.rank || 1,
      coins: data.user?.user_metadata?.coins || 100,
    };

    const token = generateToken(user);

    console.log("Login successful, JWT token generated");

    return NextResponse.json(
      {
        message: "Login successful",
        user,
        token,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const authError = error as AuthError;
    console.error("Login error details:", {
      message: authError.message,
      code: authError.code,
      details: authError.details,
      hint: authError.hint,
      stack: authError.stack,
    });

    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }
}
