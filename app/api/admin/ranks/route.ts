import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// Roman soldier ranks
const ROMAN_RANKS = [
  {
    level: 1,
    name: "Tiro",
    requiredCoins: 0,
    benefits: ["Basic platform access", "Standard features"],
    color: "from-amber-700 to-yellow-600",
    description: "Novice soldier, a recruit in training",
  },
  {
    level: 2,
    name: "Gregarius",
    requiredCoins: 500,
    benefits: ["Tiro benefits", "Reduced fees", "Priority support"],
    color: "from-gray-400 to-gray-300",
    description: "Common soldier of the legion",
  },
  {
    level: 3,
    name: "Decanus",
    requiredCoins: 2000,
    benefits: ["Gregarius benefits", "Exclusive events", "Higher limits"],
    color: "from-yellow-500 to-yellow-300",
    description: "Leader of a contubernium (squad of 8 men)",
  },
  {
    level: 4,
    name: "Centurion",
    requiredCoins: 5000,
    benefits: ["Decanus benefits", "VIP support", "Special promotions"],
    color: "from-indigo-500 to-purple-500",
    description: "Officer commanding a century (80-100 men)",
  },
  {
    level: 5,
    name: "Legatus",
    requiredCoins: 10000,
    benefits: [
      "Centurion benefits",
      "Premium features",
      "Personalized service",
    ],
    color: "from-blue-400 to-cyan-300",
    description: "General commanding a legion",
  },
];

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

// GET /api/admin/ranks - Get rank configurations and user counts by rank
export async function GET(request: Request) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // Get user counts by rank
    const usersByRank: Record<number, number> = {};

    for (let rank = 1; rank <= 5; rank++) {
      const { count, error } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("rank", rank);

      if (error) {
        console.error(`Error fetching users with rank ${rank}:`, error);
        usersByRank[rank] = 0;
      } else {
        usersByRank[rank] = count || 0;
      }
    }

    return NextResponse.json({
      ranks: ROMAN_RANKS,
      usersByRank,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/ranks:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get rank config for coin requirement
    const rankConfig = ROMAN_RANKS.find((r) => r.level === targetRank);
    if (!rankConfig) {
      return NextResponse.json(
        { message: "Rank configuration not found" },
        { status: 404 }
      );
    }

    // Find users eligible for promotion (have sufficient coins but lower rank)
    const { data: eligibleUsers, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .gte("coins", rankConfig.requiredCoins)
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

    return NextResponse.json({
      message: `${eligibleUsers.length} users promoted to ${rankConfig.name}`,
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
