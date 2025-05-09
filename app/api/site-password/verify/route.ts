import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the stored password from the database
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_password")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Failed to verify password" },
        { status: 500 }
      );
    }

    // Compare the provided password with the stored password
    if (data.value === password) {
      // Set a cookie to indicate password verification
      const response = NextResponse.json({ success: true });

      response.cookies.set({
        name: "site-password-verified",
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        // 24-hour expiration
        maxAge: 60 * 60 * 24,
      });

      return response;
    } else {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
