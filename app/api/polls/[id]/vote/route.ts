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

// POST - Cast a vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the poll ID exists
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    const pollId = resolvedParams.id;

    // Must be authenticated to vote
    const auth = verifyAuth(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    const { optionId } = await request.json();
    if (!optionId) {
      return NextResponse.json(
        { message: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("is_active")
      .eq("id", pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll:", pollError);
      return NextResponse.json(
        { message: "Failed to fetch poll" },
        { status: 500 }
      );
    }

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    if (!poll.is_active) {
      return NextResponse.json(
        { message: "This poll is no longer active" },
        { status: 400 }
      );
    }

    // Check if option belongs to this poll
    const { data: option, error: optionError } = await supabaseAdmin
      .from("poll_options")
      .select("id")
      .eq("id", optionId)
      .eq("poll_id", pollId)
      .single();

    if (optionError) {
      console.error("Error fetching option:", optionError);
      return NextResponse.json(
        { message: "Invalid option for this poll" },
        { status: 400 }
      );
    }

    // Check if user has already voted on this poll
    const { data: existingVote, error: existingVoteError } = await supabaseAdmin
      .from("votes")
      .select("id, option_id")
      .eq("poll_id", pollId)
      .eq("user_id", auth.userId)
      .single();

    // If user has already voted, don't allow them to change their vote
    if (existingVote) {
      return NextResponse.json(
        {
          message: "You have already voted on this poll",
          optionId: existingVote.option_id,
        },
        { status: 400 }
      );
    }

    // Otherwise, create a new vote
    const { error: voteError } = await supabaseAdmin.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: auth.userId,
    });

    if (voteError) {
      console.error("Error casting vote:", voteError);
      return NextResponse.json(
        { message: "Failed to cast vote" },
        { status: 500 }
      );
    }

    // Get updated vote counts for the poll
    const { data: votes, error: votesError } = await supabaseAdmin
      .from("votes")
      .select("option_id")
      .eq("poll_id", pollId);

    if (votesError) {
      console.error("Error fetching votes:", votesError);
    }

    // Count votes for each option manually
    const voteCounts: Record<string, number> = {};
    if (votes) {
      votes.forEach((vote) => {
        if (vote.option_id in voteCounts) {
          voteCounts[vote.option_id] += 1;
        } else {
          voteCounts[vote.option_id] = 1;
        }
      });
    }

    return NextResponse.json({
      message: "Vote cast successfully",
      optionId,
      voteCounts,
    });
  } catch (error) {
    console.error(`Error in POST /api/polls/[id]/vote:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
