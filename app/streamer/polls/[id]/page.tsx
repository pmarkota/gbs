"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authClient";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes?: number;
  percentage?: number;
}

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  streamer_id: string;
}

export default function PollDetailPage({ params }: { params: { id: string } }) {
  // Don't use React.use() in client components - use params directly
  const pollId = params.id;

  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const supabaseChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && pollId) {
      fetchPollDetails();
      setupRealtimeSubscription();
    }

    // Cleanup subscription on unmount
    return () => {
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.unsubscribe();
      }
    };
  }, [user, authLoading, pollId, router]);

  const setupRealtimeSubscription = () => {
    // Create a unique channel name for this poll
    const channelName = `poll-detail-${pollId}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Create a Supabase channel for votes and poll updates
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          console.log("Vote change detected for poll:", pollId);
          // Refresh poll details when votes change
          fetchPollDetails();
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
        (payload) => {
          console.log("Poll updated:", payload.new);
          // Refresh poll details when poll is updated
          fetchPollDetails();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to poll updates:", pollId);
        } else {
          console.error("Failed to subscribe to poll updates:", status);
        }
      });

    // Store channel reference
    supabaseChannelRef.current = channel;
  };

  const fetchPollDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/polls/${pollId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch poll details");
      }

      const data = await response.json();
      console.log("Raw poll data:", data);

      // Map API response fields to component fields with more detailed logging
      console.log("Poll active status:", {
        isActive: data.isActive,
        is_active: data.is_active,
        using: data.isActive !== undefined ? "isActive" : "is_active",
      });

      const pollData = {
        id: data.id,
        title: data.title,
        is_active: data.isActive !== undefined ? data.isActive : data.is_active,
        created_at:
          data.createdAt !== undefined ? data.createdAt : data.created_at,
        updated_at:
          data.updatedAt !== undefined ? data.updatedAt : data.updated_at,
        streamer_id:
          data.streamerId !== undefined ? data.streamerId : data.streamer_id,
        options: Array.isArray(data.options)
          ? data.options.map((option: any) => ({
              id: option.id,
              poll_id: pollId,
              option_text: option.text || option.option_text,
              votes: option.votes || 0,
            }))
          : [],
      };

      // Additional debug logging
      console.log("Processed poll data:", {
        title: pollData.title,
        is_active: pollData.is_active,
        options_count: pollData.options.length,
      });

      // Calculate vote counts and percentages
      const votes = pollData.options.reduce(
        (sum: number, option: PollOption) => sum + (option.votes || 0),
        0
      );
      setTotalVotes(votes);

      // Add percentage to each option
      if (votes > 0) {
        pollData.options = pollData.options.map((option: PollOption) => ({
          ...option,
          votes: option.votes || 0,
          percentage:
            votes > 0 ? Math.round(((option.votes || 0) / votes) * 100) : 0,
        }));
      }

      setPoll(pollData);
    } catch (error) {
      console.error("Error fetching poll details:", error);
      setError("Failed to load poll details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePollStatus = async () => {
    if (isToggling || !poll) return;

    setIsToggling(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const newStatus = !poll.is_active;
      console.log("Toggling poll status:", {
        currentStatus: poll.is_active,
        newStatus,
      });

      // Send both formats to ensure compatibility with the backend API
      const response = await fetch(`/api/polls/${pollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: newStatus,
          isActive: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update poll status");
      }

      // Update local state
      setPoll({
        ...poll,
        is_active: newStatus,
      });

      toast.success(
        `Poll ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating poll status:", error);
      toast.error("Failed to update poll status");
    } finally {
      setIsToggling(false);
    }
  };

  const deletePoll = async () => {
    if (isDeleting || !poll) return;

    if (
      !confirm(
        "Are you sure you want to delete this poll? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete poll");
      }

      toast.success("Poll deleted successfully");
      router.push("/streamer/polls");
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error("Failed to delete poll");
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="relative w-16 h-16">
            <div className="absolute w-16 h-16 border-4 rounded-full border-t-purple-500 border-b-indigo-500 border-l-transparent border-r-transparent animate-spin"></div>
            <div className="absolute w-10 h-10 border-4 rounded-full border-t-pink-500 border-b-fuchsia-500 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/streamer/polls"
            className="flex items-center mr-4 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Polls
          </Link>
          <h1 className="text-2xl font-bold">Poll Details</h1>
        </div>

        {error && (
          <div className="p-4 mb-6 border rounded-lg bg-red-500/20 border-red-500/40">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="space-y-4 animate-pulse">
              <div className="w-3/4 h-8 bg-gray-700 rounded"></div>
              <div className="w-1/4 h-4 bg-gray-700 rounded"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : poll ? (
          <div className="overflow-hidden bg-gray-800 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{poll.title}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    poll.is_active
                      ? "bg-green-900/20 text-green-400 border border-green-900/30"
                      : "bg-gray-700/50 text-gray-400 border border-gray-600"
                  }`}
                >
                  {poll.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Created {new Date(poll.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  {poll.options.length} options
                </div>
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 text-sm font-medium text-gray-400">
                  Poll Options
                </h3>
                <div className="space-y-3">
                  {poll.options.map((option) => (
                    <div key={option.id} className="p-4 rounded-md bg-gray-750">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {option.option_text}
                        </span>
                        <span className="text-sm">
                          {option.votes || 0} votes ({option.percentage || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 overflow-hidden bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${option.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 space-x-3 border-t border-gray-700">
                <button
                  onClick={togglePollStatus}
                  disabled={isToggling}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    poll.is_active
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                  title={poll.is_active ? "Deactivate poll" : "Activate poll"}
                >
                  {isToggling ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      {poll.is_active ? "Deactivating..." : "Activating..."}
                    </>
                  ) : poll.is_active ? (
                    <>
                      <XMarkIcon className="w-5 h-5 mr-2" />
                      Deactivate Poll
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Activate Poll
                    </>
                  )}
                </button>

                <Link
                  href={`/streamer/polls/edit/${pollId}`}
                  className="flex items-center px-3 py-2 text-sm font-medium text-yellow-400 transition-colors rounded-md bg-yellow-500/20 hover:bg-yellow-500/30"
                  title="Edit this poll"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit Poll
                </Link>

                <button
                  onClick={deletePoll}
                  disabled={isDeleting}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-400 transition-colors rounded-md bg-red-500/20 hover:bg-red-500/30"
                  title="Delete this poll permanently"
                >
                  {isDeleting ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Delete Poll
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-gray-800 rounded-lg">
            <p className="text-gray-400">
              Poll not found or you don't have permission to view it.
            </p>
            <Link
              href="/streamer/polls"
              className="inline-flex items-center px-4 py-2 mt-4 font-medium text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Back to Polls
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
