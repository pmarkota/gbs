import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Helper function to verify admin role
const verifyAdmin = (request: Request) => {
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

// POST /api/admin/ranks/promote - Promote eligible users to next rank
export async function POST(request: Request) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Parse request body
    const { targetRank } = await request.json();

    if (
      !targetRank ||
      typeof targetRank !== "number" ||
      targetRank < 1 ||
      targetRank > 5
    ) {
      return NextResponse.json(
        { message: "Invalid target rank" },
        { status: 400 }
      );
    }

    // Mapping of rank levels to required coins
    const rankRequirements = [
      { level: 1, required: 0 }, // Tiro (new recruit)
      { level: 2, required: 500 }, // Gregarius (common soldier)
      { level: 3, required: 2000 }, // Decanus (squad leader)
      { level: 4, required: 5000 }, // Centurion (officer)
      { level: 5, required: 10000 }, // Legatus (general)
    ];

    // Get the coin requirement for the target rank
    const requirement = rankRequirements.find((r) => r.level === targetRank);
    if (!requirement) {
      return NextResponse.json(
        { message: "Rank configuration not found" },
        { status: 404 }
      );
    }

    // Find users eligible for promotion (have sufficient coins but lower rank)
    const { data: eligibleUsers, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .gte("coins", requirement.required)
      .lt("rank", targetRank);

    if (error) {
      console.error("Error finding eligible users:", error);
      return NextResponse.json(
        { message: "Failed to find eligible users" },
        { status: 500 }
      );
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return NextResponse.json({
        message: "No eligible users found for promotion",
        promoted: 0,
      });
    }

    // Update ranks for eligible users
    const userIds = eligibleUsers.map((user) => user.id);
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ rank: targetRank })
      .in("id", userIds);

    if (updateError) {
      console.error("Error promoting users:", updateError);
      return NextResponse.json(
        { message: "Failed to promote users" },
        { status: 500 }
      );
    }

    const rankNames = ["Tiro", "Gregarius", "Decanus", "Centurion", "Legatus"];
    const rankName = rankNames[targetRank - 1];

    return NextResponse.json({
      message: `${eligibleUsers.length} users promoted to ${rankName} (Level ${targetRank})`,
      promoted: eligibleUsers.length,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/ranks/promote:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
