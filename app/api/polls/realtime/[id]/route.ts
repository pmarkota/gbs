import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Helper function to verify authenticated user from token parameter
const verifyAuthFromToken = (token: string | null) => {
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

// GET handler for SSE endpoint - this will be kept for backward compatibility
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get poll ID from route params
    const resolvedParams = await Promise.resolve(params);
    const pollId = resolvedParams.id;
    if (!pollId) {
      return new Response(JSON.stringify({ message: "Poll ID is required" }), {
        status: 400,
      });
    }

    // Get token from query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Verify authentication (optional for public polls)
    const auth = verifyAuthFromToken(token);
    const userId = "error" in auth ? null : auth.userId;

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("is_active, streamer_id")
      .eq("id", pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll:", pollError);
      return new Response(JSON.stringify({ message: "Failed to fetch poll" }), {
        status: 500,
      });
    }

    if (!poll) {
      return new Response(JSON.stringify({ message: "Poll not found" }), {
        status: 404,
      });
    }

    if (!poll.is_active) {
      return new Response(
        JSON.stringify({ message: "This poll is no longer active" }),
        { status: 400 }
      );
    }

    // Set up headers for SSE
    const encoder = new TextEncoder();

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        // Initial poll data
        const pollDetails = await fetchPollDetails(pollId, userId);

        if (!pollDetails) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "Failed to fetch poll details",
              })}\n\n`
            )
          );
          return;
        }

        // Send initial poll data
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(pollDetails)}\n\n`)
        );

        // Set up subscription for poll changes (votes and active status)
        const subscription = supabaseAdmin
          .channel(`poll-${pollId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "votes",
              filter: `poll_id=eq.${pollId}`,
            },
            async () => {
              // When votes change, fetch updated poll data
              const updatedPoll = await fetchPollDetails(pollId, userId);
              if (updatedPoll) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(updatedPoll)}\n\n`)
                );
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "polls",
              filter: `id=eq.${pollId}`,
            },
            async (payload) => {
              // If poll is deactivated, send update
              if (payload.new && !payload.new.is_active) {
                const updatedPoll = await fetchPollDetails(pollId, userId);
                if (updatedPoll) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(updatedPoll)}\n\n`)
                  );
                }
              }
            }
          )
          .subscribe();

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          subscription.unsubscribe();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(`Error in GET /api/polls/realtime/${params.id}:`, error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

// Helper function to fetch poll details
async function fetchPollDetails(pollId: string, userId: string | null) {
  try {
    // Get poll data
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select(
        `
        id,
        title,
        streamer_id,
        is_active,
        created_at,
        updated_at,
        users!polls_streamer_id_fkey(username)
      `
      )
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      console.error("Error fetching poll:", pollError);
      return null;
    }

    // Get poll options
    const { data: options, error: optionsError } = await supabaseAdmin
      .from("poll_options")
      .select(
        `
        id,
        option_text,
        created_at
      `
      )
      .eq("poll_id", pollId)
      .order("created_at", { ascending: true });

    if (optionsError) {
      console.error("Error fetching poll options:", optionsError);
      return null;
    }

    // Get votes for each option
    const { data: votes, error: votesError } = await supabaseAdmin
      .from("votes")
      .select("option_id")
      .eq("poll_id", pollId);

    if (votesError) {
      console.error("Error fetching votes:", votesError);
      return null;
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
    if (userId) {
      const { data: vote } = await supabaseAdmin
        .from("votes")
        .select("option_id")
        .eq("poll_id", pollId)
        .eq("user_id", userId)
        .single();

      if (vote) {
        userVote = vote.option_id;
      }
    }

    // Format response
    const formattedOptions = options.map((option) => ({
      id: option.id,
      text: option.option_text,
      votes: voteCounts[option.id] || 0,
    }));

    const totalVotes = Object.values(voteCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      id: poll.id,
      title: poll.title,
      streamerId: poll.streamer_id,
      streamerName: poll.users ? (poll.users as any).username : null,
      isActive: poll.is_active,
      createdAt: poll.created_at,
      options: formattedOptions,
      totalVotes,
      userVote,
    };
  } catch (error) {
    console.error("Error in fetchPollDetails:", error);
    return null;
  }
}
