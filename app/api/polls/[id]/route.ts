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

// GET - Get poll details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure pollId is available before proceeding
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    const pollId = resolvedParams.id;

    // Check authentication - public can see active polls
    const auth = verifyAuth(request);
    const isAuthenticated = !("error" in auth);

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

    // If poll is not active and user is not the streamer who created it, deny access
    if (
      !poll.is_active &&
      (!isAuthenticated ||
        (auth.userId !== poll.streamer_id && auth.role !== "admin"))
    ) {
      return NextResponse.json(
        { message: "Poll not available" },
        { status: 403 }
      );
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
      return NextResponse.json(
        { message: "Failed to fetch poll options" },
        { status: 500 }
      );
    }

    // Get votes for each option - replacing group() with a different approach
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

    // Count votes for each option manually
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
    if (isAuthenticated) {
      const { data: vote, error: voteError } = await supabaseAdmin
        .from("votes")
        .select("option_id")
        .eq("poll_id", pollId)
        .eq("user_id", auth.userId)
        .single();

      if (voteError && voteError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is expected if user hasn't voted
        console.error("Error fetching user vote:", voteError);
      } else if (vote) {
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

    const result = {
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

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in GET /api/polls/[id]:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update poll (only for streamers who own the poll)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure pollId is available before proceeding
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    const pollId = resolvedParams.id;

    // Authenticate and authorize
    const auth = verifyAuth(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Get poll to check ownership
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("streamer_id")
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

    // Only allow the streamer who created the poll or an admin to update it
    if (poll.streamer_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { message: "You don't have permission to update this poll" },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const { title, isActive, is_active, options } = requestBody;
    const updates: any = {};

    if (title !== undefined) updates.title = title;

    // Handle both isActive and is_active parameters
    if (isActive !== undefined || is_active !== undefined) {
      // Prioritize is_active if both are provided
      updates.is_active = is_active !== undefined ? is_active : isActive;
    }

    // If no updates provided and no options to update
    if (Object.keys(updates).length === 0 && !options) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 }
      );
    }

    // Start a transaction to update both poll and options if needed
    if (options && Array.isArray(options)) {
      // Get existing options
      const { data: existingOptions, error: existingOptionsError } =
        await supabaseAdmin
          .from("poll_options")
          .select("id")
          .eq("poll_id", pollId);

      if (existingOptionsError) {
        console.error("Error fetching existing options:", existingOptionsError);
        return NextResponse.json(
          { message: "Failed to fetch existing options" },
          { status: 500 }
        );
      }

      const existingOptionIds = new Set(existingOptions.map((o) => o.id));

      // Process options to update, add, or remove
      const optionsToUpdate = [];
      const optionsToAdd = [];

      for (const option of options) {
        if (option.id && existingOptionIds.has(option.id)) {
          // Update existing option
          optionsToUpdate.push({
            id: option.id,
            option_text: option.text,
          });
          existingOptionIds.delete(option.id);
        } else if (!option.id) {
          // Add new option
          optionsToAdd.push({
            poll_id: pollId,
            option_text: option.text,
          });
        }
      }

      // Remaining IDs in existingOptionIds should be deleted
      const optionIdsToDelete = Array.from(existingOptionIds);

      // Start transaction
      const { error: updateError } = await supabaseAdmin
        .from("polls")
        .update(updates)
        .eq("id", pollId);

      if (updateError) {
        console.error("Error updating poll:", updateError);
        return NextResponse.json(
          { message: "Failed to update poll" },
          { status: 500 }
        );
      }

      // Update existing options
      for (const option of optionsToUpdate) {
        const { error } = await supabaseAdmin
          .from("poll_options")
          .update({ option_text: option.option_text })
          .eq("id", option.id);

        if (error) {
          console.error("Error updating option:", error);
          return NextResponse.json(
            { message: "Failed to update poll options" },
            { status: 500 }
          );
        }
      }

      // Add new options
      if (optionsToAdd.length > 0) {
        const { error } = await supabaseAdmin
          .from("poll_options")
          .insert(optionsToAdd);

        if (error) {
          console.error("Error adding new options:", error);
          return NextResponse.json(
            { message: "Failed to add new poll options" },
            { status: 500 }
          );
        }
      }

      // Delete removed options
      if (optionIdsToDelete.length > 0) {
        const { error } = await supabaseAdmin
          .from("poll_options")
          .delete()
          .in("id", optionIdsToDelete);

        if (error) {
          console.error("Error deleting options:", error);
          return NextResponse.json(
            { message: "Failed to delete removed options" },
            { status: 500 }
          );
        }
      }
    } else {
      // Just update the poll if no options provided
      const { error: updateError } = await supabaseAdmin
        .from("polls")
        .update(updates)
        .eq("id", pollId);

      if (updateError) {
        console.error("Error updating poll:", updateError);
        return NextResponse.json(
          { message: "Failed to update poll" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Poll updated successfully" });
  } catch (error) {
    console.error(`Error in PATCH /api/polls/[id]:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete poll (only for streamers who own the poll)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure pollId is available before proceeding
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "Poll ID is required" },
        { status: 400 }
      );
    }

    const pollId = resolvedParams.id;

    // Authenticate and authorize
    const auth = verifyAuth(request);
    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Get poll to check ownership
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("streamer_id")
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

    // Only allow the streamer who created the poll or an admin to delete it
    if (poll.streamer_id !== auth.userId && auth.role !== "admin") {
      return NextResponse.json(
        { message: "You don't have permission to delete this poll" },
        { status: 403 }
      );
    }

    // Delete the poll (cascade will handle options and votes)
    const { error: deleteError } = await supabaseAdmin
      .from("polls")
      .delete()
      .eq("id", pollId);

    if (deleteError) {
      console.error("Error deleting poll:", deleteError);
      return NextResponse.json(
        { message: "Failed to delete poll" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error(`Error in DELETE /api/polls/[id]:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
