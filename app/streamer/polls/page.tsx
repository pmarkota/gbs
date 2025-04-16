"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authClient";
import Link from "next/link";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/toaster";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function PollsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    if (isFetching) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Add the streamer ID to the request to get streamer's polls
      const response = await fetch(`/api/polls?streamerId=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch polls");
      }

      const data = await response.json();
      console.log("Fetched streamer polls:", data);

      // Check if data is an array or if it has a polls property
      const pollsData = Array.isArray(data) ? data : data.polls || [];

      // Need to fetch the details for each poll to get the options and votes
      const pollDetailsPromises = pollsData.map(
        async (poll: Record<string, unknown>) => {
          try {
            const detailResponse = await fetch(`/api/polls/${poll.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!detailResponse.ok) {
              console.warn(`Failed to fetch details for poll ${poll.id}`);
              return {
                ...poll,
                options: [],
                is_active:
                  poll.isActive !== undefined ? poll.isActive : poll.is_active,
                user_id: poll.streamerId || poll.user_id,
                created_at: poll.createdAt || poll.created_at,
                updated_at: poll.updatedAt || poll.updated_at,
              };
            }

            const pollDetail = await detailResponse.json();
            return {
              id: pollDetail.id,
              title: pollDetail.title,
              options: Array.isArray(pollDetail.options)
                ? pollDetail.options.map(
                    (option: {
                      id: string;
                      text?: string;
                      option_text?: string;
                      votes?: number;
                    }) => ({
                      id: option.id,
                      text: option.text || option.option_text,
                      votes: option.votes || 0,
                    })
                  )
                : [],
              is_active:
                pollDetail.isActive !== undefined
                  ? pollDetail.isActive
                  : pollDetail.is_active,
              user_id: pollDetail.streamerId || pollDetail.user_id,
              created_at: pollDetail.createdAt || pollDetail.created_at,
              updated_at: pollDetail.updatedAt || pollDetail.updated_at,
            };
          } catch (err) {
            console.error(`Error fetching details for poll ${poll.id}:`, err);
            // Return the poll with minimal data if fetch fails
            return {
              ...poll,
              options: [],
              is_active:
                poll.isActive !== undefined ? poll.isActive : poll.is_active,
              user_id: poll.streamerId || poll.user_id,
              created_at: poll.createdAt || poll.created_at,
              updated_at: poll.updatedAt || poll.updated_at,
            };
          }
        }
      );

      const pollsWithDetails = await Promise.all(pollDetailsPromises);

      // Sort polls by created_at date (newest first)
      const sortedPolls = pollsWithDetails.sort(
        (a: Poll, b: Poll) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPolls(sortedPolls);
    } catch (error) {
      console.error("Error fetching polls:", error);
      setError("Failed to load polls. Please try again.");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [user, isFetching]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchPolls();
    }
  }, [user, authLoading, router, fetchPolls]);

  const togglePollActive = async (pollId: string) => {
    if (isToggling) return;

    setIsToggling(pollId);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Find current status
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;

      const newStatus = !poll.is_active;
      console.log("Toggling poll status:", {
        pollId,
        currentStatus: poll.is_active,
        newStatus,
      });

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
        throw new Error(
          `Failed to ${newStatus ? "activate" : "deactivate"} poll`
        );
      }

      // Update local state
      setPolls(
        polls.map((poll) =>
          poll.id === pollId ? { ...poll, is_active: newStatus } : poll
        )
      );

      toast.success(
        `Poll ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling poll active status:", error);
      toast.error("Failed to update poll status");
    } finally {
      setIsToggling(null);
    }
  };

  const deletePoll = async (pollId: string) => {
    if (isDeleting) return;

    if (!confirm("Are you sure you want to delete this poll?")) {
      return;
    }

    setIsDeleting(pollId);

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

      // Remove poll from state
      setPolls(polls.filter((poll) => poll.id !== pollId));
      toast.success("Poll deleted successfully");
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error("Failed to delete poll");
    } finally {
      setIsDeleting(null);
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Polls</h1>
          <div className="flex space-x-2">
            <button
              onClick={fetchPolls}
              disabled={isFetching}
              className="p-2 transition-colors bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50"
              aria-label="Refresh polls"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
            <Link
              href="/streamer/polls/create"
              className="flex items-center px-4 py-2 transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Create Poll
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 border rounded-lg bg-red-500/20 border-red-500/40">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="w-1/3 h-6 bg-gray-700 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : polls.length === 0 ? (
          <div className="p-6 py-12 text-center bg-gray-800 rounded-lg">
            <p className="mb-4 text-gray-400">
              You don&apos;t have any polls yet
            </p>
            <Link
              href="/streamer/polls/create"
              className="inline-flex items-center px-4 py-2 transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Create Your First Poll
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden bg-gray-800 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-sm font-medium text-left">
                    Title
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-left">
                    Created
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-center">
                    Votes
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {polls.map((poll) => {
                  const totalVotes =
                    poll.options?.reduce(
                      (sum, option) => sum + (option.votes || 0),
                      0
                    ) || 0;
                  const formattedDate = new Date(
                    poll.created_at
                  ).toLocaleDateString();

                  return (
                    <tr key={poll.id} className="hover:bg-gray-750">
                      <td className="px-4 py-4">
                        <div className="font-medium">{poll.title}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {poll.options?.length || 0} options
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            poll.is_active
                              ? "bg-green-900/20 text-green-400 border border-green-900/30"
                              : "bg-gray-700/50 text-gray-400 border border-gray-600"
                          }`}
                        >
                          {poll.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => togglePollActive(poll.id)}
                            disabled={isToggling === poll.id}
                            className={`p-2 rounded-full transition-colors ${
                              poll.is_active
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }`}
                            aria-label={
                              poll.is_active
                                ? "Deactivate poll"
                                : "Activate poll"
                            }
                            title={
                              poll.is_active
                                ? "Deactivate poll"
                                : "Activate poll"
                            }
                          >
                            {isToggling === poll.id ? (
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : poll.is_active ? (
                              <XMarkIcon className="w-5 h-5" />
                            ) : (
                              <CheckIcon className="w-5 h-5" />
                            )}
                          </button>
                          <Link
                            href={`/streamer/polls/${poll.id}`}
                            className="p-2 text-blue-400 transition-colors rounded-full bg-blue-500/20 hover:bg-blue-500/30"
                            aria-label="View poll"
                            title="View poll details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/streamer/polls/edit/${poll.id}`}
                            className="p-2 text-yellow-400 transition-colors rounded-full bg-yellow-500/20 hover:bg-yellow-500/30"
                            aria-label="Edit poll"
                            title="Edit poll"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => deletePoll(poll.id)}
                            disabled={isDeleting === poll.id}
                            className="p-2 text-red-400 transition-colors rounded-full bg-red-500/20 hover:bg-red-500/30"
                            aria-label="Delete poll"
                            title="Delete poll"
                          >
                            {isDeleting === poll.id ? (
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                              <TrashIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
