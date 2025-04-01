import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Helper function to verify admin role
const verifyAdmin = (request: NextRequest) => {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.user.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { userId: decoded.user.id };
};

// GET /api/admin/users/[id] - Get a specific user by ID (admin only)
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    // Verify admin
    const auth = verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Get user by ID
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in GET /api/admin/users/[id]:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update a user (admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    // Verify admin
    const auth = verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Parse request body
    const { username, email, role, rank, coins } = await request.json();

    // Validate data
    if (
      !username &&
      !email &&
      role === undefined &&
      rank === undefined &&
      coins === undefined
    ) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", params.id)
      .single();

    if (userError || !existingUser) {
      console.error("Error checking user existence:", userError);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check username/email uniqueness if changing those fields
    if (username || email) {
      const uniqueCheckQuery = supabaseAdmin
        .from("users")
        .select("id")
        .neq("id", params.id);

      if (username) {
        uniqueCheckQuery.eq("username", username);
      }

      if (email) {
        uniqueCheckQuery.eq("email", email);
      }

      const { data: duplicateUser } = await uniqueCheckQuery;

      if (duplicateUser && duplicateUser.length > 0) {
        return NextResponse.json(
          { message: "Username or email already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, string | number> = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (rank !== undefined) updateData.rank = rank;
    if (coins !== undefined) updateData.coins = coins;

    // Update user in database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", params.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { message: "Failed to update user" },
        { status: 500 }
      );
    }

    // If email is being updated, update auth as well
    if (email) {
      const { error: authUpdateError } =
        await supabaseAdmin.auth.admin.updateUserById(params.id, { email });

      if (authUpdateError) {
        console.error("Error updating user email in auth:", authUpdateError);
        // Continue anyway, as the database update was successful
      }
    }

    // Get updated user
    const { data: updatedUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      console.error("Error fetching updated user:", fetchError);
      return NextResponse.json(
        { message: "User updated but failed to fetch details" },
        { status: 200 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error in PATCH /api/admin/users/[id]:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    // Verify admin
    const auth = verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Prevent deleting self
    if (auth.userId === params.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", params.id)
      .single();

    if (userError || !existingUser) {
      console.error("Error checking user existence:", userError);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete user from auth (which will cascade to users table due to foreign key constraint)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      params.id
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { message: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
