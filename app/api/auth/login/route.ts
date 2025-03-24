import { NextResponse } from "next/server";
import { signIn } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";

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
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    });

    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }
}
