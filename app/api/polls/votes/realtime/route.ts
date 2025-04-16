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

// POST - Create a realtime channel for vote updates
export async function POST(request: NextRequest) {
  try {
    // Get request parameters
    const { pollId } = await request.json();

    if (!pollId) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("id, is_active")
      .eq("id", pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll:", pollError);
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    if (!poll.is_active) {
      return NextResponse.json(
        { message: "Cannot subscribe to inactive poll" },
        { status: 400 }
      );
    }

    // Create a unique channel name
    const channelName = `poll_votes_${pollId}_${Date.now()}`;

    // Return the channel configuration
    return NextResponse.json({
      channelName,
      pollId,
      realtimeConfig: {
        table: "votes",
        eventTypes: ["INSERT", "UPDATE", "DELETE"],
        filters: {
          poll_id: pollId,
        },
      },
    });
  } catch (error) {
    console.error("Error in POST /api/polls/votes/realtime:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get vote counts for a poll
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pollId = url.searchParams.get("pollId");

    if (!pollId) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    // Check if poll exists
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("id, is_active")
      .eq("id", pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll:", pollError);
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    // Get all options for this poll
    const { data: options, error: optionsError } = await supabaseAdmin
      .from("poll_options")
      .select("id, option_text")
      .eq("poll_id", pollId);

    if (optionsError) {
      console.error("Error fetching options:", optionsError);
      return NextResponse.json(
        { message: "Failed to fetch poll options" },
        { status: 500 }
      );
    }

    // Get votes for each option
    const { data: votes, error: votesError } = await supabaseAdmin
      .from("votes")
      .select("option_id")
      .eq("poll_id", pollId);

    if (votesError) {
      console.error("Error fetching votes:", votesError);
      return NextResponse.json(
        { message: "Failed to fetch votes" },
        { status: 500 }
      );
    }

    // Count votes for each option
    const voteCounts: Record<string, number> = {};
    votes.forEach((vote) => {
      if (vote.option_id in voteCounts) {
        voteCounts[vote.option_id] += 1;
      } else {
        voteCounts[vote.option_id] = 1;
      }
    });

    // Get user's vote if authenticated
    let userVote = null;
    const auth = verifyAuth(request);
    if (!("error" in auth)) {
      const { data: vote, error: voteError } = await supabaseAdmin
        .from("votes")
        .select("option_id")
        .eq("poll_id", pollId)
        .eq("user_id", auth.userId)
        .single();

      if (!voteError && vote) {
        userVote = vote.option_id;
      }
    }

    // Format the results
    const formattedOptions = options.map((option) => ({
      id: option.id,
      text: option.option_text,
      votes: voteCounts[option.id] || 0,
    }));

    const totalVotes = Object.values(voteCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return NextResponse.json({
      pollId,
      isActive: poll.is_active,
      options: formattedOptions,
      totalVotes,
      userVote,
    });
  } catch (error) {
    console.error("Error in GET /api/polls/votes/realtime:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
