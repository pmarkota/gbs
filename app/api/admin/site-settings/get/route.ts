import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
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

    // Get all site settings
    const { data, error } = await supabase.from("site_settings").select("*");

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch settings", error: error.message },
        { status: 500 }
      );
    }

    // Convert the data to a more convenient format for the frontend
    const formattedSettings = data.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings: formattedSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
