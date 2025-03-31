import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/dashboard - Get dashboard stats (admin only)
export async function GET(request: Request) {
  try {
    // Verify admin authorization
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error fetching user count:", usersError);
      return NextResponse.json(
        { message: "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: newUsersToday, error: newUsersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (newUsersError) {
      console.error("Error fetching new users count:", newUsersError);
      return NextResponse.json(
        { message: "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }

    // Get total coins across all users
    const { data: coinsData, error: coinsError } = await supabaseAdmin
      .from("users")
      .select("coins");

    if (coinsError) {
      console.error("Error fetching coins data:", coinsError);
      return NextResponse.json(
        { message: "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }

    const totalCoins = coinsData.reduce((sum, user) => sum + user.coins, 0);

    // Get average rank
    const { data: rankData, error: rankError } = await supabaseAdmin
      .from("users")
      .select("rank");

    if (rankError) {
      console.error("Error fetching rank data:", rankError);
      return NextResponse.json(
        { message: "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }

    const averageRank =
      rankData.length > 0
        ? rankData.reduce((sum, user) => sum + user.rank, 0) / rankData.length
        : 0;

    // Get user activity trends (last 7 months)
    const userActivityData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const { count: usersInMonth, error: monthError } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", month.toISOString())
        .lte("created_at", nextMonth.toISOString());

      if (monthError) {
        console.error(
          `Error fetching users for month ${month.getMonth() + 1}:`,
          monthError
        );
        continue;
      }

      const monthName = month.toLocaleString("default", { month: "short" });
      userActivityData.push({
        name: monthName,
        users: usersInMonth || 0,
        coins: (usersInMonth || 0) * 100 + Math.floor(Math.random() * 10000), // Mock data for coins
      });
    }

    // Get rank distribution
    const rankDistribution = [];
    for (let rank = 1; rank <= 5; rank++) {
      const { count: usersWithRank, error: rankCountError } =
        await supabaseAdmin
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("rank", rank);

      if (rankCountError) {
        console.error(
          `Error fetching users with rank ${rank}:`,
          rankCountError
        );
        continue;
      }

      rankDistribution.push({
        name: `Rank ${rank}`,
        count: usersWithRank || 0,
      });
    }

    // Return dashboard stats
    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalCoins,
        averageRank,
      },
      userActivity: userActivityData,
      rankDistribution,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/dashboard:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
