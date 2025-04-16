"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/authClient";
import { toast } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  streamerId: string;
  streamerName: string;
  options: Option[];
  totalVotes: number;
  userVote: string | null;
}

export default function ActivePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [votingPolls, setVotingPolls] = useState<Set<string>>(new Set());
  const [votingOptions, setVotingOptions] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const { user, isLoading: authLoading } = useAuth();
  // Track active poll subscriptions
  const [activeChannels, setActiveChannels] = useState<{
    [key: string]: ReturnType<typeof supabase.channel>;
  }>({});
  // Track global polls subscription
  const [pollsChannel, setPollsChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      // Fetch active polls when user loads
      fetchActivePolls();

      // Set up global polls subscription
      setupGlobalPollsSubscription();
    }

    // Cleanup on unmount
    return () => {
      if (pollsChannel) {
        pollsChannel.unsubscribe();
      }
    };
  }, [user, authLoading]);

  // Set up a global subscription to monitor all poll changes
  const setupGlobalPollsSubscription = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("No auth token available for Supabase subscription");
        return;
      }

      // Create a Supabase channel for polls table - use anonymous access instead of JWT
      const channel = supabase
        .channel(
          `global-polls-${Math.random().toString(36).substring(2, 15)}`,
          {
            config: {
              broadcast: { self: true },
            },
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "polls",
          },
          async (payload) => {
            console.log("New poll created:", payload.new);
            // New poll was created, check if it's active
            const newPoll = payload.new;
            if (newPoll && newPoll.is_active === true) {
              console.log("Fetching new active poll details:", newPoll.id);
              const pollDetails = await fetchPollDetails(newPoll.id);

              if (pollDetails) {
                console.log("Adding new poll to UI:", pollDetails);
                // Add new poll to the state
                setPolls((currentPolls) => {
                  // Check if poll already exists in the list
                  if (currentPolls.some((poll) => poll.id === pollDetails.id)) {
                    return currentPolls;
                  }
                  return [...currentPolls, pollDetails];
                });

                // Set up subscription for the new poll
                setupPollSubscription(newPoll.id);
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "polls",
          },
          async (payload) => {
            console.log("Poll updated:", payload.new);
            const updatedPoll = payload.new;

            // Handle poll activation
            if (updatedPoll && updatedPoll.is_active === true) {
              console.log("Poll activated:", updatedPoll.id);

              // Check if we already have this poll in the current state
              // This is a synchronous check before starting the async operation
              let pollExists = false;
              setPolls((currentPolls) => {
                pollExists = currentPolls.some(
                  (poll) => poll.id === updatedPoll.id
                );
                return currentPolls; // Return unchanged state
              });

              // Only fetch and add if poll doesn't exist
              if (!pollExists) {
                const pollDetails = await fetchPollDetails(updatedPoll.id);
                if (pollDetails) {
                  console.log("Adding activated poll to UI:", pollDetails);

                  // Double-check poll doesn't exist before adding
                  setPolls((currentPolls) => {
                    if (
                      currentPolls.some((poll) => poll.id === pollDetails.id)
                    ) {
                      return currentPolls; // Poll already exists
                    }
                    return [...currentPolls, pollDetails];
                  });

                  // Set up subscription for this poll
                  setupPollSubscription(updatedPoll.id);
                }
              } else {
                console.log(
                  "Poll already exists in state, skipping:",
                  updatedPoll.id
                );
              }
            }

            // Handle poll deactivation
            else if (updatedPoll && updatedPoll.is_active === false) {
              console.log(
                "Poll deactivated, removing from UI:",
                updatedPoll.id
              );
              // Remove the deactivated poll
              setPolls((currentPolls) =>
                currentPolls.filter((poll) => poll.id !== updatedPoll.id)
              );

              // Clean up the subscription for this poll
              if (activeChannels[updatedPoll.id]) {
                console.log(
                  "Cleaning up subscription for poll:",
                  updatedPoll.id
                );
                activeChannels[updatedPoll.id].unsubscribe();
                setActiveChannels((prev) => {
                  const updated = { ...prev };
                  delete updated[updatedPoll.id];
                  return updated;
                });
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "polls",
          },
          (payload) => {
            console.log("Poll deleted:", payload.old.id);
            const deletedPollId = payload.old.id;

            // Remove the deleted poll
            setPolls((currentPolls) =>
              currentPolls.filter((poll) => poll.id !== deletedPollId)
            );

            // Clean up the subscription for this poll
            if (activeChannels[deletedPollId]) {
              console.log(
                "Cleaning up subscription for deleted poll:",
                deletedPollId
              );
              activeChannels[deletedPollId].unsubscribe();
              setActiveChannels((prev) => {
                const updated = { ...prev };
                delete updated[deletedPollId];
                return updated;
              });
            }
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to global polls changes");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Failed to subscribe to global polls changes:", err);
            // Instead of showing an error, just retry once
            if (retryCount < 1) {
              setRetryCount((prevCount) => prevCount + 1);
              setTimeout(() => setupGlobalPollsSubscription(), 2000);
            }
          }
        });

      // Store the global channel
      setPollsChannel(channel);
    } catch (error) {
      console.error("Error setting up global polls subscription:", error);
    }
  };

  // Set up a realtime subscription for a specific poll
  const setupPollSubscription = async (pollId: string) => {
    // If we already have a subscription for this poll, skip
    if (activeChannels[pollId]) return;

    try {
      // Create a unique channel name for this poll
      const channelName = `poll-${pollId}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;

      // Create a Supabase channel for this poll - use anonymous access
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
          async () => {
            // When votes change, fetch updated poll details
            const updatedPoll = await fetchPollDetails(pollId);
            if (updatedPoll) {
              setPolls((currentPolls) =>
                currentPolls.map((poll) =>
                  poll.id === updatedPoll.id ? updatedPoll : poll
                )
              );

              // Update voted polls if needed
              if (updatedPoll.userVote) {
                setVotedPolls((prev) => new Set(prev).add(updatedPoll.id));
              }
            }
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
          async (payload) => {
            const updatedPoll = payload.new;

            // If poll was deactivated, remove it
            if (updatedPoll && updatedPoll.is_active === false) {
              setPolls((currentPolls) =>
                currentPolls.filter((poll) => poll.id !== pollId)
              );

              // Clean up the subscription
              channel.unsubscribe();
              setActiveChannels((prev) => {
                const updated = { ...prev };
                delete updated[pollId];
                return updated;
              });
            } else {
              // Otherwise fetch the updated poll details
              const pollDetails = await fetchPollDetails(pollId);
              if (pollDetails) {
                setPolls((currentPolls) =>
                  currentPolls.map((poll) =>
                    poll.id === pollDetails.id ? pollDetails : poll
                  )
                );
              }
            }
          }
        )
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") {
            // Handle subscription failure
            console.error(`Failed to subscribe to poll ${pollId}:`, status);
            if (retryCount < 3) {
              setRetryCount((prevCount) => prevCount + 1);
              setTimeout(() => setupPollSubscription(pollId), 2000);
            }
          } else {
            // Reset retry count on successful connection
            setRetryCount(0);
          }
        });

      // Store channel in state
      setActiveChannels((prev) => ({
        ...prev,
        [pollId]: channel,
      }));
    } catch (error) {
      console.error(`Error setting up subscription for poll ${pollId}:`, error);
    }
  };

  const fetchActivePolls = async () => {
    try {
      setIsLoading(true);
      // Get token if user is logged in
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Use the API endpoint to get active polls
      const response = await fetch("/api/polls?active=true", {
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch polls");
      }

      if (data.polls && Array.isArray(data.polls)) {
        // Fetch details for each poll
        const pollDetails = await Promise.all(
          data.polls.map(async (poll: { id: string }) => {
            const detail = await fetchPollDetails(poll.id);
            return detail;
          })
        );

        const validPolls = pollDetails.filter((p) => p !== null);
        setPolls(validPolls);

        // Update voted polls set
        const newVotedPolls = new Set<string>(votedPolls);
        validPolls.forEach((poll) => {
          if (poll.userVote) {
            newVotedPolls.add(poll.id);
          }
          // Set up realtime subscription for each poll
          setupPollSubscription(poll.id);
        });
        setVotedPolls(newVotedPolls);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching active polls:", error);
      setIsLoading(false);
      toast.error("Failed to load polls. Please try again.");
    }
  };

  const fetchPollDetails = async (pollId: string) => {
    try {
      // Get token if user is logged in
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/polls/${pollId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch poll details");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching details for poll ${pollId}:`, error);
      return null;
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }

    // Check if user has already voted on this poll
    if (votedPolls.has(pollId)) {
      toast.info("You have already voted on this poll");
      return;
    }

    try {
      // Set loading state for this specific poll and option
      setVotingPolls((prev) => new Set(prev).add(pollId));
      setVotingOptions((prev) => new Set(prev).add(optionId));

      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication required");
        setVotingPolls((prev) => {
          const updated = new Set(prev);
          updated.delete(pollId);
          return updated;
        });
        setVotingOptions((prev) => {
          const updated = new Set(prev);
          updated.delete(optionId);
          return updated;
        });
        return;
      }

      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId }),
      });

      const data = await response.json();

      if (
        response.status === 400 &&
        data.message &&
        data.message.includes("already voted")
      ) {
        // User already voted - update UI to reflect this
        toast.info("You have already voted on this poll");

        // Mark poll as voted and update state
        setVotedPolls((prev) => new Set(prev).add(pollId));

        // Fetch the poll details to get the correct user vote
        const updatedPoll = await fetchPollDetails(pollId);
        if (updatedPoll) {
          // Update the poll with the user's vote
          setPolls((currentPolls) =>
            currentPolls.map((poll) =>
              poll.id === pollId ? updatedPoll : poll
            )
          );
        }
      } else if (!response.ok) {
        throw new Error(data.message || "Failed to submit vote");
      } else {
        // Vote was successful
        setVotedPolls((prev) => new Set(prev).add(pollId));
        toast.success("Vote submitted successfully");

        // Immediately update the UI with the new vote
        const updatedPoll = await fetchPollDetails(pollId);
        if (updatedPoll) {
          setPolls((currentPolls) =>
            currentPolls.map((poll) =>
              poll.id === pollId ? updatedPoll : poll
            )
          );
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to submit vote");
    } finally {
      // Clear loading state
      setVotingPolls((prev) => {
        const updated = new Set(prev);
        updated.delete(pollId);
        return updated;
      });
      setVotingOptions((prev) => {
        const updated = new Set(prev);
        updated.delete(optionId);
        return updated;
      });
    }
  };

  // If user is not logged in, show a login prompt instead
  if (!authLoading && !user) {
    return (
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-3xl font-bold text-center text-white"
          >
            <span className="text-primary">LIVE</span> POLLS
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-8 text-center bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-[0_0_25px_rgba(212,175,55,0.1)]"
          >
            <p className="mb-6 text-lg text-gray-300">
              Sign in to view and vote on live polls
            </p>
            <motion.a
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(212,175,55,0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              href="/auth"
              className="inline-block px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
              tabIndex={0}
              aria-label="Sign in to participate in polls"
            >
              Sign In
            </motion.a>
          </motion.div>
        </div>
      </section>
    );
  }

  if (isLoading && polls.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-3xl font-bold text-center text-white"
          >
            <span className="text-primary">LIVE</span> POLLS
          </motion.h2>
          <div className="flex flex-col items-center justify-center h-60">
            <motion.div
              animate={{
                rotate: 360,
                boxShadow: [
                  "0 0 10px rgba(212,175,55,0.3)",
                  "0 0 20px rgba(212,175,55,0.5)",
                  "0 0 10px rgba(212,175,55,0.3)",
                ],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
              className="relative w-16 h-16 mb-4"
            >
              <div className="absolute w-16 h-16 border-4 rounded-full border-t-primary border-b-purple-500 border-l-transparent border-r-transparent"></div>
              <div className="absolute w-10 h-10 border-4 rounded-full border-t-pink-500 border-b-primary border-l-transparent border-r-transparent left-3 top-3"></div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400"
            >
              Loading active polls...
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  if (polls.length === 0 && !isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-3xl font-bold text-center text-white"
          >
            <span className="text-primary">LIVE</span> POLLS
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-8 text-center bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-[0_0_25px_rgba(212,175,55,0.1)]"
          >
            <p className="mb-2 text-lg text-gray-300">
              No active polls at the moment
            </p>
            <p className="text-sm text-gray-400">
              Check back later for new polls
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl font-bold text-center text-white"
        >
          <span className="text-primary">LIVE</span> POLLS
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {polls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl"
            >
              {/* Animated background glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(212,175,55,0.1)",
                    "0 0 20px rgba(212,175,55,0.2)",
                    "0 0 10px rgba(212,175,55,0.1)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="absolute inset-0 rounded-2xl"
              />
              <div className="relative overflow-hidden border border-gray-700 shadow-lg bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <motion.h3
                      className="text-2xl font-bold text-white"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {poll.title}
                    </motion.h3>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30"
                    >
                      <span className="w-2 h-2 mr-1.5 bg-primary rounded-full animate-pulse"></span>
                      LIVE
                    </motion.span>
                  </div>

                  <motion.p
                    className="mb-5 text-sm text-primary"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    by {poll.streamerName}
                  </motion.p>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {poll.options.map((option, optIndex) => {
                        const isVoted = votedPolls.has(poll.id);
                        const isVoting =
                          votingPolls.has(poll.id) &&
                          votingOptions.has(option.id);
                        const isSelected = poll.userVote === option.id;
                        const percentage = calculatePercentage(
                          option.votes,
                          poll.totalVotes
                        );

                        return (
                          <motion.div
                            key={option.id}
                            className="relative"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.2 + optIndex * 0.1,
                            }}
                            layout
                          >
                            {isVoted ? (
                              // Show results with progress bar
                              <div className="overflow-hidden rounded-lg">
                                <div className="relative border border-gray-600 h-14 bg-gray-700/60 backdrop-blur-sm">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      duration: 1,
                                      ease: "easeOut",
                                    }}
                                    className={`absolute left-0 top-0 h-full ${
                                      isSelected
                                        ? "bg-gradient-to-r from-primary to-primary/80"
                                        : "bg-gray-600/80"
                                    }`}
                                  />
                                  <div className="relative z-10 flex items-center justify-between h-full px-4">
                                    <span className="flex items-center font-medium text-white">
                                      {option.text}
                                      {isSelected && (
                                        <motion.svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-5 h-5 ml-2 text-primary"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          initial={{ scale: 0 }}
                                          animate={{
                                            scale: 1,
                                            rotate: [0, 15, 0],
                                          }}
                                          transition={{ duration: 0.5 }}
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </motion.svg>
                                      )}
                                    </span>
                                    <div className="flex items-center">
                                      <span className="mr-2 text-sm text-gray-400">
                                        {option.votes} votes
                                      </span>
                                      <motion.span
                                        className="font-bold text-white"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                          delay: 0.8,
                                          duration: 0.5,
                                        }}
                                      >
                                        {percentage}%
                                      </motion.span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Show voting button
                              <motion.button
                                onClick={() => handleVote(poll.id, option.id)}
                                disabled={votingPolls.has(poll.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative w-full px-4 py-4 text-left text-white overflow-hidden rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/50
                                  ${
                                    isVoting
                                      ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                      : "bg-gray-700/60 hover:bg-gray-700/80 hover:border-gray-500 border-gray-600"
                                  }`}
                                aria-label={`Vote for ${option.text}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    handleVote(poll.id, option.id);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.text}</span>
                                  {isVoting && (
                                    <div className="flex items-center">
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: "linear",
                                        }}
                                        className="w-5 h-5 mr-2 border-2 rounded-full border-t-primary border-b-white border-l-transparent border-r-transparent"
                                      />
                                      <span className="text-xs font-medium text-primary">
                                        Voting...
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Animated pulse effect on hover */}
                                <motion.div
                                  className="absolute inset-0 rounded-lg bg-primary/10"
                                  initial={{ opacity: 0 }}
                                  whileHover={{
                                    opacity: [0, 0.2, 0],
                                    scale: [1, 1.05, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                />
                              </motion.button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center justify-between mt-5 text-sm"
                  >
                    <span className="text-gray-400">
                      Total votes:{" "}
                      <span className="font-medium text-white">
                        {poll.totalVotes}
                      </span>
                    </span>
                    {votedPolls.has(poll.id) && (
                      <motion.span
                        className="px-2 py-1 text-xs border rounded-full text-primary border-primary/30 bg-primary/10"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        Results updating live
                      </motion.span>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
