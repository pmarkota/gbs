"use client";

import { useState, useEffect } from "react";
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  ChartBarIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";

interface CoinStats {
  totalCoins: number;
  averageCoins: number;
  topUserCoins: number;
  recentActivity: number;
  totalUsers: number;
}

interface CoinDistribution {
  range: string;
  count: number;
}

interface TopUser {
  id: string;
  username: string;
  coins: number;
  rank: number;
}

interface CoinHistory {
  id: string;
  username: string;
  amount: number;
  type: "add" | "subtract";
  reason: string;
  date: string;
}

export default function CoinsPage() {
  const [stats, setStats] = useState<CoinStats>({
    totalCoins: 0,
    averageCoins: 0,
    topUserCoins: 0,
    recentActivity: 0,
    totalUsers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState(100);
  const [coinReason, setCoinReason] = useState("");
  const [operationType, setOperationType] = useState<"add" | "subtract">("add");
  const [distribution, setDistribution] = useState<CoinDistribution[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentHistory, setRecentHistory] = useState<CoinHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoinData();
  }, []);

  const fetchCoinData = async () => {
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

      // In a real app, you would call a coins API endpoint
      // For now, we'll use mock data
      setTimeout(() => {
        // Mock stats data
        setStats({
          totalCoins: 128750,
          averageCoins: 643,
          topUserCoins: 9850,
          recentActivity: 34,
          totalUsers: 100,
        });

        // Mock distribution data
        setDistribution([
          { range: "0-500", count: 78 },
          { range: "501-2000", count: 52 },
          { range: "2001-5000", count: 38 },
          { range: "5001-10000", count: 25 },
          { range: "10000+", count: 7 },
        ]);

        // Mock top users data
        setTopUsers([
          { id: "1", username: "AureliusMaximus", coins: 9850, rank: 4 },
          { id: "2", username: "SpartacusElite", coins: 8720, rank: 4 },
          { id: "3", username: "CaesarVictorious", coins: 7650, rank: 4 },
          { id: "4", username: "GladiatorChamp", coins: 6840, rank: 4 },
          { id: "5", username: "RomanConqueror", coins: 6210, rank: 3 },
        ]);

        // Mock history data
        setRecentHistory([
          {
            id: "h1",
            username: "AureliusMaximus",
            amount: 500,
            type: "add",
            reason: "Tournament winner bonus",
            date: "2023-08-15T14:22:31Z",
          },
          {
            id: "h2",
            username: "SpartacusElite",
            amount: 250,
            type: "add",
            reason: "Daily login streak reward",
            date: "2023-08-15T12:15:45Z",
          },
          {
            id: "h3",
            username: "GladiatorChamp",
            amount: 100,
            type: "subtract",
            reason: "Penalty for rule violation",
            date: "2023-08-14T18:30:12Z",
          },
          {
            id: "h4",
            username: "RomanConqueror",
            amount: 300,
            type: "add",
            reason: "Content creation reward",
            date: "2023-08-14T10:45:23Z",
          },
          {
            id: "h5",
            username: "LegionnaireX",
            amount: 150,
            type: "add",
            reason: "Referral bonus",
            date: "2023-08-13T21:17:52Z",
          },
        ]);

        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching coin data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      toast.error("Failed to load coin data");
    }
  };

  const handleCoinOperation = async () => {
    try {
      // Validate input
      if (!selectedUser) {
        toast.error("Please select a user");
        return;
      }

      if (coinAmount <= 0) {
        toast.error("Coin amount must be greater than zero");
        return;
      }

      if (!coinReason.trim()) {
        toast.error("Please provide a reason for this transaction");
        return;
      }

      // In a real app, you would call an API to add/subtract coins
      // For demonstration, we'll just show a success toast
      toast.success(
        `Successfully ${
          operationType === "add" ? "added" : "subtracted"
        } ${coinAmount} coins ${
          operationType === "add" ? "to" : "from"
        } user ${selectedUser} for reason: ${coinReason}`
      );

      // Reset form
      setSelectedUser("");
      setCoinAmount(100);
      setCoinReason("");
      setIsModalOpen(false);

      // Refresh data
      fetchCoinData();
    } catch (error) {
      console.error("Error managing coins:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to manage coins"
      );
    }
  };

  const getRankName = (rank: number) => {
    const ranks = ["Tiro", "Gregarius", "Decanus", "Centurion", "Legatus"];
    return ranks[rank - 1] || "Unknown";
  };

  if (isLoading && topUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-t-[#d4af37] border-b-amber-800 border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-t-amber-600 border-b-amber-700 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute left-1/4 -top-20 w-48 h-48 rounded-full bg-[#d4af37] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.3,
          }}
          className="absolute right-1/3 top-1/3 w-64 h-64 rounded-full bg-[#d4af37] blur-3xl"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.h1
          className="text-2xl font-bold text-white flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <BanknotesIcon className="w-7 h-7 mr-2 text-[#d4af37]" />
          Coin Management
        </motion.h1>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => {
              setOperationType("add");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Award Coins
          </button>
          <button
            onClick={() => {
              setOperationType("subtract");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <MinusIcon className="h-5 w-5" />
            Deduct Coins
          </button>
          <button
            onClick={fetchCoinData}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          className="bg-red-900/40 border border-red-500 text-red-100 px-4 py-3 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Coins</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalCoins.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-amber-700 to-[#d4af37] rounded-lg p-3 text-white shadow-lg">
                <BanknotesIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Platform-wide coin economy
            </p>
          </div>
          <div className="bg-gray-700/30 p-4">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-700 to-[#d4af37] rounded-full w-3/4"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Average Per User
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.averageCoins.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg p-3 text-white shadow-lg">
                <ChartBarIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Mean coin balance across users
            </p>
          </div>
          <div className="bg-gray-700/30 p-4">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-2/3"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Highest Balance
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.topUserCoins.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg p-3 text-white shadow-lg">
                <ArrowUpIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Top user's current coin balance
            </p>
          </div>
          <div className="bg-gray-700/30 p-4">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full w-5/6"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Recent Transactions
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.recentActivity}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-lg p-3 text-white shadow-lg">
                <ArrowPathIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Transactions in last 24 hours
            </p>
          </div>
          <div className="bg-gray-700/30 p-4">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full w-1/2"></div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Users */}
        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              Top Coin Holders
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {topUsers.map((user, index) => (
              <motion.div
                key={user.id}
                className="p-4 hover:bg-gray-700/40 transition-colors"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mr-3 text-[#d4af37] font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">
                        {getRankName(user.rank)} (Rank {user.rank})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BanknotesIcon className="h-4 w-4 text-[#d4af37] mr-1" />
                    <span className="font-bold text-white">
                      {user.coins.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-gray-900/30">
            <button
              onClick={() => {
                setOperationType("add");
                setIsModalOpen(true);
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] text-white rounded-lg hover:from-[#d4af37] hover:to-amber-700 transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Award Coins to User
            </button>
          </div>
        </motion.div>

        {/* Coin Distribution */}
        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              Coin Distribution
            </h2>
          </div>

          <div className="px-4 py-6">
            {distribution.map((item) => (
              <div key={item.range} className="mb-5 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    {item.range} coins
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {item.count} users
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="bg-gradient-to-r from-amber-700 to-[#d4af37] h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (item.count /
                          distribution.reduce(
                            (max, curr) => Math.max(max, curr.count),
                            0
                          )) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 1, delay: 0.8 }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-900/30">
            <div className="text-sm text-gray-400 text-center">
              Based on {stats.totalUsers} active users
            </div>
          </div>
        </motion.div>

        {/* Recent Coin Activity */}
        <motion.div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <ArrowPathIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
              Recent Coin Activity
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {recentHistory.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-700/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">
                      {activity.username}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {activity.reason}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                      activity.type === "add"
                        ? "bg-green-900/40 text-green-400"
                        : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {activity.type === "add" ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    <span>
                      {activity.type === "add" ? "+" : "-"}
                      {activity.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-900/30 text-center">
            <button
              onClick={fetchCoinData}
              className="text-[#d4af37] hover:text-amber-400 text-sm font-medium transition-colors"
            >
              View All Activity
            </button>
          </div>
        </motion.div>
      </div>

      {/* Coin Management Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-700 backdrop-blur-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal glowing effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-800 via-gray-800 to-amber-800 rounded-xl blur opacity-30"></div>

              <div className="relative">
                <div
                  className={`h-3 bg-gradient-to-r ${
                    operationType === "add"
                      ? "from-green-600 to-green-400"
                      : "from-red-600 to-red-400"
                  }`}
                ></div>
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <BanknotesIcon className="h-5 w-5 text-[#d4af37] mr-2" />
                    {operationType === "add" ? "Award Coins" : "Deduct Coins"}
                  </h3>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCoinOperation();
                  }}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="user"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Select User
                    </label>
                    <input
                      type="text"
                      id="user"
                      placeholder="Enter username"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Coin Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Reason
                    </label>
                    <textarea
                      id="reason"
                      value={coinReason}
                      onChange={(e) => setCoinReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                      placeholder="Enter reason for this coin transaction"
                      required
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded-md transition-colors shadow-md ${
                        operationType === "add"
                          ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                          : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                      }`}
                    >
                      {operationType === "add" ? "Award Coins" : "Deduct Coins"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
