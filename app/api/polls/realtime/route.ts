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

// POST - Create a realtime channel for poll updates
export async function POST(request: NextRequest) {
  try {
    // Get request parameters
    const { channelName } = await request.json();

    if (!channelName) {
      return NextResponse.json(
        { message: "Channel name is required" },
        { status: 400 }
      );
    }

    // Create a unique channel token
    const channelToken = `${channelName}_${Date.now()}`;

    // Return the channel configuration
    return NextResponse.json({
      channelName,
      channelToken,
      realtimeConfig: {
        table: "polls",
        eventTypes: ["INSERT", "UPDATE", "DELETE"],
        filters: {
          // For public channels, only return active polls
          isActive: channelName.startsWith("public") ? true : undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error in POST /api/polls/realtime:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get active polls for public view or for a specific streamer
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const streamerId = url.searchParams.get("streamerId");
    const activeOnly = url.searchParams.get("active") === "true";

    // Create base query for polls
    let query = supabaseAdmin.from("polls").select(`
      id,
      title,
      streamer_id,
      is_active,
      created_at,
      updated_at,
      users!polls_streamer_id_fkey(username)
    `);

    // Handle filtering
    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    if (streamerId) {
      // Check if user is authenticated and is the streamer in question
      const auth = verifyAuth(request);
      if (
        !("error" in auth) &&
        (auth.userId === streamerId || auth.role === "admin")
      ) {
        query = query.eq("streamer_id", streamerId);
      } else {
        // For non-owners, only show active polls
        query = query.eq("streamer_id", streamerId).eq("is_active", true);
      }
    } else {
      // No streamer ID - only show active polls
      query = query.eq("is_active", true);
    }

    // Order by most recent
    query = query.order("created_at", { ascending: false });

    // Execute query
    const { data: polls, error } = await query;

    if (error) {
      console.error("Error fetching polls:", error);
      return NextResponse.json(
        { message: "Failed to fetch polls" },
        { status: 500 }
      );
    }

    // Format the results
    const formattedPolls = polls.map((poll) => ({
      id: poll.id,
      title: poll.title,
      streamerId: poll.streamer_id,
      streamerName: poll.users ? (poll.users as any).username : null,
      isActive: poll.is_active,
      createdAt: poll.created_at,
    }));

    return NextResponse.json({ polls: formattedPolls });
  } catch (error) {
    console.error("Error in GET /api/polls/realtime:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
