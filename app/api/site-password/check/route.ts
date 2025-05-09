import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if password protection is enabled
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "password_protection_enabled")
      .single();

    if (error) {
      return NextResponse.json(
        { passwordProtectionEnabled: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { passwordProtectionEnabled: data.value === "true" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking password protection:", error);
    return NextResponse.json(
      { passwordProtectionEnabled: false },
      { status: 200 }
    );
  }
}
