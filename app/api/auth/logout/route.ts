import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Define an error interface for better typing
interface AuthError {
  message: string;
}

export async function POST() {
  try {
    // Logout from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const authError = error as AuthError;
    console.error("Logout error:", authError.message);

    return NextResponse.json(
      { message: authError.message || "Logout failed" },
      { status: 500 }
    );
  }
}
