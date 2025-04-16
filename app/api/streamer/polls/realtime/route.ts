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

    const streamerId = auth.userId;

    // Set up headers for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial polls data
        const { data: pollsData, error: pollsError } = await supabaseAdmin
          .from("polls")
          .select("*")
          .eq("streamer_id", streamerId)
          .order("created_at", { ascending: false });

        if (pollsError) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Failed to fetch polls" })}\n\n`
            )
          );
          return;
        }

        // Send initial polls data
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "initial", polls: pollsData })}\n\n`
          )
        );

        // Set up real-time subscription for poll status changes
        const subscription = supabaseAdmin
          .channel("poll-status-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "polls",
              filter: `streamer_id=eq.${streamerId}`,
            },
            async (payload) => {
              // Get updated poll data
              const pollId = payload.new ? payload.new.id : null;
              if (!pollId) return;

              const { data: pollData, error: pollError } = await supabaseAdmin
                .from("polls")
                .select("*")
                .eq("id", pollId)
                .single();

              if (pollError) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      error: "Failed to fetch updated poll",
                    })}\n\n`
                  )
                );
                return;
              }

              // Send update event
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "update",
                    poll: pollData,
                  })}\n\n`
                )
              );
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
    console.error("Error in GET /api/streamer/polls/realtime:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
