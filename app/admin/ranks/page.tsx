"use client";

import { useState, useEffect } from "react";
import {
  TrophyIcon,
  ChevronUpIcon,
  UserIcon,
  ArrowUpIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";

interface RankConfig {
  level: number;
  name: string;
  requiredCoins: number;
  benefits: string[];
  color: string;
  description: string;
}

export default function RanksPage() {
  const [rankConfigs, setRankConfigs] = useState<RankConfig[]>([]);
  const [selectedRank, setSelectedRank] = useState<RankConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  const [usersByRank, setUsersByRank] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanksData();
  }, []);

  const fetchRanksData = async () => {
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

      // Call ranks API
      const response = await fetch("/api/admin/ranks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ranks data");
      }

      setRankConfigs(data.ranks);
      setUsersByRank(data.usersByRank);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching ranks data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      toast.error("Failed to load ranks data");
    }
  };

  // Commenting out unused function
  /* 
  const handleSaveRank = (rank: RankConfig) => {
    // In a real app, this would be an API call to update the rank configuration
    setRankConfigs(rankConfigs.map((r) => (r.level === rank.level ? rank : r)));
    setIsModalOpen(false);
    setSelectedRank(null);
    toast.success("Rank settings saved");
  };
  */

  const handlePromoteUsers = async (rankLevel: number) => {
    try {
      setIsPromoting(true);

      // Get token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication token not found");
        setIsPromoting(false);
        return;
      }

      // Call promote API
      const response = await fetch("/api/admin/ranks/promote", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetRank: rankLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to promote users");
      }

      toast.success(
        data.message || `${data.promoted} users promoted successfully`
      );

      // Refetch ranks data to get updated user counts
      fetchRanksData();
    } catch (error) {
      console.error("Error promoting users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to promote users"
      );
    } finally {
      setIsPromoting(false);
    }
  };

  if (isLoading && rankConfigs.length === 0) {
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
          <TrophyIcon className="w-7 h-7 mr-2 text-[#d4af37]" />
          Roman Rank Management
        </motion.h1>

        <motion.button
          onClick={() => handlePromoteUsers(5)} // Promote to highest rank
          disabled={isPromoting}
          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] text-white rounded-lg hover:from-[#d4af37] hover:to-amber-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpIcon className="h-5 w-5" />
          <span>Promote Eligible Users</span>
        </motion.button>
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

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {rankConfigs.map((rank, index) => (
          <motion.div
            key={rank.level}
            className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.15)] transition-all duration-300 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.1 * index + 0.3 },
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`h-2 bg-gradient-to-r ${rank.color}`}></div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full bg-gradient-to-r ${rank.color} text-white shadow-lg`}
                  >
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {rank.name}
                    </h3>
                    <p className="text-sm text-gray-400">Level {rank.level}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-3 py-1 bg-gray-700/70 rounded-full text-sm font-medium text-white border border-gray-600">
                    {rank.requiredCoins.toLocaleString()} coins
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-400 italic">
                &quot;{rank.description}&quot;
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300">Benefits:</h4>
                <ul className="mt-2 space-y-1.5">
                  {rank.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-400 flex items-start"
                    >
                      <ChevronUpIcon className="h-4 w-4 text-[#d4af37] mr-2 mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    {usersByRank[rank.level]?.toLocaleString() || "0"} users
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedRank(rank);
                    setIsModalOpen(true);
                  }}
                  className="text-[#d4af37] hover:text-amber-500 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Rank progression visualization */}
      <motion.div
        className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md p-6 border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.15)] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <ShieldExclamationIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
          Roman Rank Progression
        </h2>

        <div className="relative py-8">
          <div className="absolute left-0 right-0 h-1 top-10 bg-gray-700"></div>

          <div className="flex justify-between relative z-10">
            {rankConfigs.map((rank, index) => (
              <motion.div
                key={rank.level}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <motion.div
                  className={`h-8 w-8 rounded-full bg-gradient-to-r ${rank.color} flex items-center justify-center text-white font-bold shadow-lg`}
                  whileHover={{
                    scale: 1.2,
                    boxShadow: "0 0 15px 2px rgba(212, 175, 55, 0.4)",
                  }}
                >
                  {rank.level}
                </motion.div>
                <motion.p
                  className="mt-2 text-sm font-medium text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  {rank.name}
                </motion.p>
                <p className="text-xs text-gray-400">
                  {rank.requiredCoins.toLocaleString()} coins
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {usersByRank[rank.level]?.toLocaleString() || "0"} users
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Rank Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedRank && (
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
                  className={`h-3 bg-gradient-to-r ${selectedRank.color}`}
                ></div>
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <TrophyIcon className="h-5 w-5 text-[#d4af37] mr-2" />
                    {selectedRank.name} - Roman Rank
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full bg-gradient-to-r ${selectedRank.color} text-white shadow-lg mr-3`}
                        >
                          <TrophyIcon className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedRank.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Level {selectedRank.level}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gray-800 rounded-full text-white border border-gray-600">
                        {selectedRank.requiredCoins.toLocaleString()} coins
                      </div>
                    </div>

                    <p className="mt-4 text-gray-300 italic">
                      &quot;{selectedRank.description}&quot;
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">
                      Users with this rank
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-[#d4af37]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {usersByRank[selectedRank.level]?.toLocaleString() ||
                            "0"}
                        </div>
                        <div className="text-sm text-gray-400">Total users</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Benefits</h4>
                    <ul className="space-y-2">
                      {selectedRank.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronUpIcon className="h-5 w-5 text-[#d4af37] mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handlePromoteUsers(selectedRank.level)}
                      disabled={isPromoting}
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] text-white rounded-lg hover:from-[#d4af37] hover:to-amber-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ArrowUpIcon className="h-5 w-5" />
                      Promote Users to {selectedRank.name}
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-800/50 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
