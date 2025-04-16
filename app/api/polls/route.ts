import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Helper function to verify authenticated user
const verifyAuth = (request: NextRequest) => {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Invalid token", status: 401 };
  }

  return {
    userId: decoded.user.id,
    role: decoded.user.role,
  };
};

// GET - List polls (public ones or all for a streamer)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active") === "true";
    const streamerId = url.searchParams.get("streamerId");

    // For public access, only return active polls
    // For streamer access, verify it's the streamer requesting their own polls
    const auth = verifyAuth(request);
    const isPublicRequest = "error" in auth;
    const isStreamerRequest =
      !isPublicRequest &&
      streamerId &&
      auth.userId === streamerId &&
      auth.role === "streamer";

    let query = supabaseAdmin.from("polls").select(`
      id,
      title,
      streamer_id,
      is_active,
      created_at,
      updated_at,
      users!polls_streamer_id_fkey(username)
    `);

    // If public request, only show active polls
    if (isPublicRequest) {
      query = query.eq("is_active", true);
    }
    // If streamer request, filter by streamer_id
    else if (isStreamerRequest) {
      query = query.eq("streamer_id", streamerId);
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
    }
    // If authenticated but not owner, only show active polls
    else {
      query = query.eq("is_active", true);
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching polls:", error);
      return NextResponse.json(
        { message: "Failed to fetch polls" },
        { status: 500 }
      );
    }

    // Transform data to include streamer username
    const polls = data.map((poll: any) => ({
      id: poll.id,
      title: poll.title,
      streamerId: poll.streamer_id,
      streamerName: poll.users?.username,
      isActive: poll.is_active,
      createdAt: poll.created_at,
      updatedAt: poll.updated_at,
    }));

    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Error in GET /api/polls:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new poll (streamers only)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Only allow streamers to create polls
    if (auth.role !== "streamer") {
      return NextResponse.json(
        { message: "Only streamers can create polls" },
        { status: 403 }
      );
    }

    const { title, options, isActive } = await request.json();

    // Validate input
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { message: "Title and at least two options are required" },
        { status: 400 }
      );
    }

    // Create poll
    // Use isActive parameter if provided, otherwise set to false by default
    const { data, error } = await supabaseAdmin
      .from("polls")
      .insert({
        title,
        streamer_id: auth.userId,
        is_active: isActive !== undefined ? isActive : false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating poll:", error);
      return NextResponse.json(
        { message: "Failed to create poll" },
        { status: 500 }
      );
    }

    // Create options
    const pollId = data.id;

    // Handle both cases: array of strings or array of objects with text property
    const optionPromises = options
      .filter((opt) => {
        const optionText = typeof opt === "string" ? opt : opt.text;
        return (
          optionText &&
          typeof optionText === "string" &&
          optionText.trim() !== ""
        );
      })
      .map((opt) => {
        const optionText = typeof opt === "string" ? opt : opt.text;
        return supabaseAdmin.from("poll_options").insert({
          poll_id: pollId,
          option_text: optionText.trim(),
        });
      });

    // Wait for all options to be created
    const optionResults = await Promise.all(optionPromises);

    // Check if any option creation failed
    const optionErrors = optionResults.filter((result) => result.error);
    if (optionErrors.length > 0) {
      console.error("Error creating poll options:", optionErrors);
      // Try to delete the poll if option creation failed
      await supabaseAdmin.from("polls").delete().eq("id", pollId);
      return NextResponse.json(
        { message: "Failed to create poll options" },
        { status: 500 }
      );
    }

    return NextResponse.json({ pollId: data.id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/polls:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
