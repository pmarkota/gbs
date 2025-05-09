import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user info to verify admin status
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Update the specified setting
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);

    if (error) {
      return NextResponse.json(
        { message: "Failed to update setting", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
