import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || "";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Set up base query
    let query = supabaseAdmin.from("users").select("*", { count: "exact" });

    // Apply search filter if provided
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Get paginated results
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { message: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const { username, email, role, rank, coins } = await request.json();

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { message: "Username and email are required" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "Username or email already exists" },
        { status: 400 }
      );
    }

    if (existingUserError && existingUserError.code !== "PGRST116") {
      console.error("Error checking existing user:", existingUserError);
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create a new user with supabase auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(2, 10), // Generate random password
        email_confirm: true,
        user_metadata: { username },
      });

    if (authError) {
      console.error("Error creating user in auth:", authError);
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user in users table
    const { error } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      username,
      email,
      role: role || "user",
      rank: rank || 1,
      coins: coins || 100,
    });

    if (error) {
      console.error("Error creating user in database:", error);
      // Attempt to clean up auth user if db insertion failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Get the created user
    const { data: newUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching created user:", fetchError);
      return NextResponse.json(
        { message: "User created but failed to fetch details" },
        { status: 201 }
      );
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
