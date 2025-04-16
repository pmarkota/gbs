import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const getSupabaseClient = () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

export const supabase = getSupabaseClient();
