"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toaster";

interface StatsData {
  totalUsers: number;
  totalCoins: number;
  averageRank: number;
  newUsersToday: number;
}

interface ChartData {
  name: string;
  users: number;
  coins: number;
}

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<StatsData>({
    totalUsers: 0,
    totalCoins: 0,
    averageRank: 0,
    newUsersToday: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [userActivityData, setUserActivityData] = useState<ChartData[]>([]);
  const [rankDistribution, setRankDistribution] = useState<
    { name: string; count: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication token not found");
        setIsLoading(false);
        return;
      }

      // Call dashboard API
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setStatsData(data.stats);
      setUserActivityData(data.userActivity);
      setRankDistribution(data.rankDistribution);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      toast.error("Failed to load dashboard data");
    }
  };

  // Stats cards definition
  const stats = [
    {
      name: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: "from-blue-600 to-blue-400",
      change: "+12% from last month",
    },
    {
      name: "Total Coins",
      value: statsData.totalCoins.toLocaleString(),
      icon: BanknotesIcon,
      color: "from-amber-700 to-[#d4af37]",
      change: "+8% from last month",
    },
    {
      name: "Average Rank",
      value: statsData.averageRank.toFixed(1),
      icon: ArrowTrendingUpIcon,
      color: "from-green-600 to-green-400",
      change: "+0.3 from last month",
    },
    {
      name: "New Users Today",
      value: statsData.newUsersToday.toLocaleString(),
      icon: ShieldCheckIcon,
      color: "from-purple-600 to-purple-400",
      change: "+5 from yesterday",
    },
  ];

  if (isLoading && userActivityData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-t-[#d4af37] border-b-amber-800 border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-t-amber-600 border-b-amber-700 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
        </div>
      </div>
    );
  }

  const rankNameMap: Record<string, string> = {
    "Rank 1": "Tiro",
    "Rank 2": "Gregarius",
    "Rank 3": "Decanus",
    "Rank 4": "Centurion",
    "Rank 5": "Legatus",
  };

  // Transform rank distribution data to include Roman rank names
  const enhancedRankDistribution = rankDistribution.map((item) => ({
    ...item,
    name: rankNameMap[item.name] || item.name,
  }));

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements - reduced opacity for better text readability */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute left-1/4 -top-20 w-48 h-48 rounded-full bg-[#d4af37] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.3,
          }}
          className="absolute right-1/3 top-1/3 w-64 h-64 rounded-full bg-[#d4af37] blur-3xl"
        />
      </div>

      <div className="flex items-center justify-between">
        <motion.h1
          className="text-2xl font-bold text-white flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChartBarIcon className="w-7 h-7 mr-2 text-[#d4af37]" />
          GambleShield Admin Dashboard
        </motion.h1>
        <motion.div
          className="flex space-x-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Refresh Data
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          className="bg-red-900/80 border border-red-500 text-red-100 px-4 py-3 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Stats Grid - improved background opacity and text contrast */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.1 * index + 0.3 },
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`bg-gradient-to-r ${stat.color} rounded-lg p-3 text-white shadow-lg`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">{stat.change}</p>
            </div>
            <div className="bg-gray-700/50 p-4">
              <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full w-3/4`}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts - improved background opacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Activity Chart */}
        <motion.div
          className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md p-5 border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
            User Growth
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userActivityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="name" stroke="#D1D5DB" />
                <YAxis stroke="#D1D5DB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  }}
                  itemStyle={{ color: "#F3F4F6" }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#d4af37"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: "#1F2937" }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#d4af37" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rank Distribution Chart */}
        <motion.div
          className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md p-5 border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
            Roman Rank Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enhancedRankDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="name" stroke="#D1D5DB" />
                <YAxis stroke="#D1D5DB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  }}
                  itemStyle={{ color: "#F3F4F6" }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats/Info Section - Improved contrast */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {/* Coin Economy */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-md font-semibold text-white flex items-center">
              <BanknotesIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              Coin Economy
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Coins:</span>
                <span className="text-white font-bold">
                  {statsData.totalCoins.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average per User:</span>
                <span className="text-white font-bold">
                  {statsData.totalUsers > 0
                    ? Math.round(
                        statsData.totalCoins / statsData.totalUsers
                      ).toLocaleString()
                    : "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Max Rank Requirement:</span>
                <span className="text-white font-bold">10,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Promotion Rate:</span>
                <span className="text-white font-bold">12% monthly</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-md font-semibold text-white flex items-center">
              <UsersIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              User Demographics
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">New Today:</span>
                <span className="text-white font-bold">
                  {statsData.newUsersToday}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Users:</span>
                <span className="text-white font-bold">
                  {Math.round(statsData.totalUsers * 0.68).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Retention Rate:</span>
                <span className="text-white font-bold">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Growth Rate:</span>
                <span className="text-green-400 font-bold">+15% monthly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roman Ranks */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-md font-semibold text-white flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              Roman Ranks
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Rank:</span>
                <span className="text-white font-bold">
                  {statsData.averageRank.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Most Common:</span>
                <span className="text-white font-bold">Tiro (Level 1)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Highest Achievers:</span>
                <span className="text-white font-bold">
                  {enhancedRankDistribution.find((r) => r.name === "Legatus")
                    ?.count || 0}{" "}
                  users
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Promotion Pace:</span>
                <span className="text-white font-bold">~45 days/rank</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
