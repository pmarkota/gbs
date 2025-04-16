"use client";

import { useState, useEffect } from "react";
import {
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

interface DashboardStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
  averageVotesPerPoll: number;
}

export default function StreamerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    averageVotesPerPoll: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Get token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication token not found");
        setIsLoading(false);
        return;
      }

      // Call dashboard API
      const response = await fetch("/api/streamer/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setStats(data.stats);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-t-purple-500 border-b-indigo-500 border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-t-pink-500 border-b-fuchsia-500 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Polls",
      value: stats.totalPolls,
      icon: QuestionMarkCircleIcon,
      color: "from-purple-600 to-purple-400",
    },
    {
      name: "Active Polls",
      value: stats.activePolls,
      icon: ChartBarIcon,
      color: "from-green-600 to-green-400",
    },
    {
      name: "Total Votes",
      value: stats.totalVotes,
      icon: UserGroupIcon,
      color: "from-blue-600 to-blue-400",
    },
    {
      name: "Avg. Votes per Poll",
      value: stats.averageVotesPerPoll.toFixed(1),
      icon: ChartBarIcon,
      color: "from-amber-600 to-amber-400",
    },
  ];

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
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute left-1/4 -top-20 w-48 h-48 rounded-full bg-purple-500 blur-3xl"
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
          className="absolute right-1/3 top-1/3 w-64 h-64 rounded-full bg-fuchsia-500 blur-3xl"
        />
      </div>

      <div className="flex items-center justify-between">
        <motion.h1
          className="text-2xl font-bold text-white flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <VideoCameraIcon className="w-7 h-7 mr-2 text-purple-500" />
          Streamer Dashboard
        </motion.h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.div
            key={card.name}
            className={`relative overflow-hidden rounded-lg bg-gray-800 px-4 py-5 shadow sm:p-6`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className={`absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-gradient-to-br ${card.color} opacity-20 blur-xl`}
            />
            <dt className="truncate text-sm font-medium text-gray-400">
              <div className="flex items-center">
                <card.icon
                  className="mr-2 h-5 w-5 text-gray-300"
                  aria-hidden="true"
                />
                {card.name}
              </div>
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {card.value}
            </dd>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        className="mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/streamer/polls/create">
            <div className="group relative overflow-hidden rounded-lg bg-gray-800 p-6 shadow-sm hover:bg-gray-700 transition-all">
              <div className="absolute right-0 top-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <QuestionMarkCircleIcon
                    className="h-10 w-10 text-purple-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Create New Poll
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Create a new poll for your audience to vote on
                  </p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/streamer/polls">
            <div className="group relative overflow-hidden rounded-lg bg-gray-800 p-6 shadow-sm hover:bg-gray-700 transition-all">
              <div className="absolute right-0 top-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon
                    className="h-10 w-10 text-blue-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Manage Polls
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    View and manage your existing polls
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
