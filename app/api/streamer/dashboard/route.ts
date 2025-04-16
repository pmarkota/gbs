import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Helper function to verify streamer role
const verifyStreamer = (request: NextRequest) => {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.user.role !== "streamer") {
    return { error: "Forbidden", status: 403 };
  }

  return { userId: decoded.user.id };
};

export async function GET(request: NextRequest) {
  try {
    // Verify streamer role
    const auth = verifyStreamer(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    const userId = auth.userId;

    // Get total polls count
    const { count: totalPolls, error: pollsError } = await supabaseAdmin
      .from("polls")
      .select("*", { count: "exact", head: true })
      .eq("streamer_id", userId);

    if (pollsError) {
      console.error("Error fetching polls count:", pollsError);
      return NextResponse.json(
        { message: "Failed to fetch polls data" },
        { status: 500 }
      );
    }

    // Get active polls count
    const { count: activePolls, error: activePollsError } = await supabaseAdmin
      .from("polls")
      .select("*", { count: "exact", head: true })
      .eq("streamer_id", userId)
      .eq("is_active", true);

    if (activePollsError) {
      console.error("Error fetching active polls count:", activePollsError);
      return NextResponse.json(
        { message: "Failed to fetch active polls data" },
        { status: 500 }
      );
    }

    // Get total votes count
    const { data: voteData, error: votesError } = await supabaseAdmin
      .from("votes")
      .select(
        `
        poll_id,
        polls!inner(streamer_id)
      `
      )
      .eq("polls.streamer_id", userId);

    if (votesError) {
      console.error("Error fetching votes count:", votesError);
      return NextResponse.json(
        { message: "Failed to fetch votes data" },
        { status: 500 }
      );
    }

    const totalVotes = voteData.length;
    const averageVotesPerPoll = totalPolls ? totalVotes / totalPolls : 0;

    return NextResponse.json({
      stats: {
        totalPolls: totalPolls || 0,
        activePolls: activePolls || 0,
        totalVotes,
        averageVotesPerPoll,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/streamer/dashboard:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
