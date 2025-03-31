import { createClient } from "@supabase/supabase-js";

// Type for user
export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  rank: number;
  coins: number;
  created_at: string;
};

// Type for session info
export type Session = {
  user: User | null;
  token: string | null;
};

// Initialize the Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials are missing");
}

// Public client (for client-side operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role (for server-side operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export { supabase, supabaseAdmin };

// Authentication helpers
export async function signUp(
  email: string,
  password: string,
  username: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    throw error;
  }

  // Create a profile in the users table using admin client to bypass RLS
  if (data.user) {
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      username,
      email,
      // Default values for new fields will be handled by the database
    });

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(username: string, password: string) {
  // First get the email using username (with admin to bypass RLS)
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("email, role, rank, coins")
    .eq("username", username)
    .single();

  if (userError) {
    throw new Error("Invalid username or password");
  }

  // Then sign in with email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  });

  if (error) {
    throw error;
  }

  // Add role, rank, and coins to the user object
  if (data.user) {
    data.user.user_metadata = {
      ...data.user.user_metadata,
      role: userData.role,
      rank: userData.rank,
      coins: userData.coins,
    };
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  // Get additional user data from the users table (with admin to bypass RLS)
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", data.session.user.id)
    .single();

  if (userError) {
    return null;
  }

  return {
    user: userData as User,
    token: data.session.access_token,
  };
}
