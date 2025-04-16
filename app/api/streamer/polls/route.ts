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

// GET - Get streamer's polls with statistics
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = verifyAuth(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Verify user is a streamer
    if (auth.role !== "streamer") {
      return NextResponse.json(
        { message: "Only streamers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all polls for this streamer
    const { data: pollsData, error: pollsError } = await supabaseAdmin
      .from("polls")
      .select(
        `
        id,
        title,
        streamer_id,
        is_active,
        created_at,
        updated_at
      `
      )
      .eq("streamer_id", auth.userId)
      .order("created_at", { ascending: false });

    if (pollsError) {
      console.error("Error fetching polls:", pollsError);
      return NextResponse.json(
        { message: "Failed to fetch polls" },
        { status: 500 }
      );
    }

    // For each poll, get the vote count
    const pollsWithStats = await Promise.all(
      pollsData.map(async (poll) => {
        const { count, error: voteCountError } = await supabaseAdmin
          .from("votes")
          .select("id", { count: "exact" })
          .eq("poll_id", poll.id);

        if (voteCountError) {
          console.error("Error counting votes:", voteCountError);
          return {
            ...poll,
            totalVotes: 0,
          };
        }

        return {
          ...poll,
          totalVotes: count || 0,
        };
      })
    );

    // Calculate overall statistics
    const totalPolls = pollsWithStats.length;
    const activePolls = pollsWithStats.filter((poll) => poll.is_active).length;
    const totalVotes = pollsWithStats.reduce(
      (sum, poll) => sum + (poll.totalVotes || 0),
      0
    );
    const avgVotesPerPoll =
      totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

    return NextResponse.json({
      polls: pollsWithStats,
      stats: {
        totalPolls,
        activePolls,
        totalVotes,
        avgVotesPerPoll,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/streamer/polls:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
