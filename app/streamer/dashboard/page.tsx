"use client";

import { useState, useEffect } from "react";
// Replace the api import with a simple fetch function
// import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "@/components/ui/charts";

// Define Poll and PollOption interfaces
interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  streamer_id: string;
  question: string;
  active: boolean;
  created_at: string;
  options: PollOption[];
  total_votes: number;
}

// Simple API client as a fallback
const apiClient = {
  get: async (url: string) => {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return { data: await response.json() };
  },
};

export default function StreamerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    avgVotesPerPoll: 0,
  });
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollChartData, setPollChartData] = useState<
    { name: string; total: number }[]
  >([]);
  const [wsError, setWsError] = useState<string | null>(null);

  // Function to fetch poll data
  const fetchPollData = async () => {
    try {
      setLoading(true);
      // Use our apiClient instead of the imported api
      const response = await apiClient.get("/api/streamer/polls");
      const data = response.data;

      // Add null checks and default values to prevent "Cannot read properties of undefined" errors
      if (data && data.polls) {
        setPolls(data.polls);
        setPollStats({
          totalPolls: data.totalPolls || 0,
          activePolls: data.activePolls || 0,
          totalVotes: data.totalVotes || 0,
          avgVotesPerPoll: data.avgVotesPerPoll || 0,
        });

        // Create data for the bar chart - last 7 polls by votes
        if (Array.isArray(data.polls) && data.polls.length > 0) {
          const chartData = data.polls
            .slice(0, Math.min(7, data.polls.length))
            .map((poll: Poll) => ({
              name:
                poll.question && poll.question.length > 15
                  ? poll.question.substring(0, 15) + "..."
                  : poll.question || "Untitled",
              total: poll.total_votes || 0,
            }))
            .reverse();
          setPollChartData(chartData);
        } else {
          setPollChartData([]);
        }
      } else {
        // Handle case where data.polls is undefined
        setPolls([]);
        setPollStats({
          totalPolls: 0,
          activePolls: 0,
          totalVotes: 0,
          avgVotesPerPoll: 0,
        });
        setPollChartData([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching poll data:", err);
      setError("Failed to load poll data. Please try again.");
      setLoading(false);
      // Use our toast function from the imported component
      toast.error("Failed to load poll data. Please try again.");
    }
  };

  // Connect to real-time updates
  useEffect(() => {
    // Initial fetch
    fetchPollData();

    // Setup websocket connection for real-time updates
    let wsConnection: WebSocket | null = null;

    const setupRealTimeUpdates = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication required");
          return;
        }

        // Close any existing connection
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.close();
        }

        // Reset WebSocket error state
        setWsError(null);

        // Determine WebSocket protocol based on current URL protocol
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;

        // Create WebSocket connection to the WebSocket server
        wsConnection = new WebSocket(
          `${protocol}//${host}/api/socket?token=${token}`
        );

        // Set up WebSocket event handlers
        wsConnection.onopen = () => {
          console.log("WebSocket connection established");

          // Subscribe to streamer polls updates
          if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            wsConnection.send(
              JSON.stringify({
                type: "subscribe",
                topic: "streamer_polls",
              })
            );
          }
        };

        wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.error) {
              console.error("WebSocket Error:", data.error);
              toast.error(data.error);
              return;
            }

            // Handle different message types
            if (data.type === "initial" && Array.isArray(data.polls)) {
              updatePollsData(data.polls);
            } else if (data.type === "update" && data.poll) {
              // Update polls list with the updated poll
              setPolls((prevPolls) => {
                if (!Array.isArray(prevPolls)) return [];

                const updatedPolls = [...prevPolls];
                const index = updatedPolls.findIndex(
                  (p) => p && p.id === data.poll.id
                );

                if (index !== -1) {
                  updatedPolls[index] = data.poll;
                } else {
                  updatedPolls.unshift(data.poll);
                }

                return updatedPolls;
              });

              // Recalculate stats
              recalculateStats();
            } else if (data.type === "poll_created") {
              // Add new poll to the list and refresh data
              fetchPollData();
            } else if (data.type === "poll_deleted") {
              // Remove deleted poll and refresh data
              fetchPollData();
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsConnection.onerror = (error) => {
          console.error("WebSocket error:", error);
          setWsError("Connection error. Real-time updates may be unavailable.");
          toast.error(
            "Connection Error: Real-time updates disconnected. Trying to reconnect..."
          );
        };

        wsConnection.onclose = (event) => {
          console.log(`WebSocket closed with code ${event.code}`);

          // If closed abnormally, try to reconnect
          if (event.code !== 1000) {
            setTimeout(setupRealTimeUpdates, 5000);
          }
        };
      } catch (err) {
        console.error("Error setting up real-time updates:", err);
        setWsError(
          "Failed to set up real-time updates. Please refresh the page."
        );
      }
    };

    // Update polls data and recalculate stats
    const updatePollsData = (pollsData: Poll[]) => {
      if (!Array.isArray(pollsData)) {
        console.error("Expected pollsData to be an array but got:", pollsData);
        return;
      }

      setPolls(pollsData);
      recalculateStats();

      // Update chart data - add null checks
      if (pollsData.length > 0) {
        const chartData = pollsData
          .slice(0, Math.min(7, pollsData.length))
          .map((poll) => ({
            name:
              poll.question && poll.question.length > 15
                ? poll.question.substring(0, 15) + "..."
                : poll.question || "Untitled",
            total: poll.total_votes || 0,
          }))
          .reverse();
        setPollChartData(chartData);
      } else {
        setPollChartData([]);
      }
    };

    // Recalculate stats based on current polls data
    const recalculateStats = () => {
      // Add safety checks for polls
      if (!Array.isArray(polls)) {
        setPollStats({
          totalPolls: 0,
          activePolls: 0,
          totalVotes: 0,
          avgVotesPerPoll: 0,
        });
        return;
      }

      const activePolls = polls.filter((p) => p && p.active).length;
      const totalVotes = polls.reduce(
        (sum, poll) => sum + (poll && poll.total_votes ? poll.total_votes : 0),
        0
      );
      const avgVotesPerPoll =
        polls.length > 0 ? Math.round(totalVotes / polls.length) : 0;

      setPollStats({
        totalPolls: polls.length,
        activePolls,
        totalVotes,
        avgVotesPerPoll,
      });
    };

    // Set up real-time updates
    setupRealTimeUpdates();

    // Clean up on unmount
    return () => {
      // Close WebSocket connection if it exists
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  // Create data for the bar chart
  useEffect(() => {
    if (Array.isArray(polls) && polls.length > 0) {
      const chartData = polls
        .slice(0, Math.min(7, polls.length))
        .map((poll) => ({
          name:
            poll.question && poll.question.length > 15
              ? poll.question.substring(0, 15) + "..."
              : poll.question || "Untitled",
          total: poll.total_votes || 0,
        }))
        .reverse();
      setPollChartData(chartData);
    } else {
      setPollChartData([]);
    }
  }, [polls]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              className="w-full mt-4"
              onClick={() => {
                setError(null);
                fetchPollData();
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 pt-6 space-y-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {wsError && (
        <div className="p-2 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
          {wsError}{" "}
          <button
            className="ml-2 underline"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}

      <Tabs defaultValue="polls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Polls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[80px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {pollStats.totalPolls}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Polls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[80px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {pollStats.activePolls}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Votes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[80px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {pollStats.totalVotes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Avg. Votes per Poll
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[80px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {pollStats.avgVotesPerPoll}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Poll Votes</CardTitle>
                <CardDescription>
                  Vote distribution across your recent polls
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : pollChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={pollChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No poll data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Poll Listing */}
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Polls</CardTitle>
                <CardDescription>
                  Your most recent polls and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="w-full h-20" />
                      ))}
                  </div>
                ) : Array.isArray(polls) && polls.length > 0 ? (
                  <div className="space-y-4">
                    {polls.slice(0, 5).map((poll) => (
                      <div
                        key={poll.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{poll.question}</h4>
                            <Badge
                              variant={poll.active ? "default" : "secondary"}
                            >
                              {poll.active ? "Active" : "Ended"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {new Date(poll.created_at).toLocaleDateString()} •{" "}
                            {poll.total_votes} votes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No polls created yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Coming soon: Additional analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section is under development. More analytics will be
                  available soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
