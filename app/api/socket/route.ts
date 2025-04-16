import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// WebSocket connections map
const connections = new Map();

// WebSocket implementation
export async function GET(request: NextRequest) {
  // Extract token from query parameters
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    });
  }

  // Get user details
  const userId = decoded.user.id;
  const userRole = decoded.user.role;

  // Check WebSocket support
  if (!request.headers.get("upgrade")?.includes("websocket")) {
    return new Response(
      JSON.stringify({ error: "WebSocket protocol required" }),
      { status: 426 }
    );
  }

  try {
    // Create a WebSocket pair
    const { socket: serverSocket, response } = new WebSocketPair();

    // Store user connection
    if (!connections.has(userId)) {
      connections.set(userId, {
        socket: serverSocket,
        subscriptions: new Set(),
        userId,
        userRole,
      });
    } else {
      // Close existing connection and update
      const existingConnection = connections.get(userId);
      if (existingConnection?.socket?.readyState === WebSocket.OPEN) {
        existingConnection.socket.close();
      }
      connections.set(userId, {
        socket: serverSocket,
        subscriptions: existingConnection?.subscriptions || new Set(),
        userId,
        userRole,
      });
    }

    // Initialize connection
    serverSocket.accept();

    // Handle messages from client
    serverSocket.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle subscription requests
        if (message.type === "subscribe") {
          const connection = connections.get(userId);
          if (connection) {
            // Add topic to user's subscriptions
            connection.subscriptions.add(message.topic);

            // Set up Supabase realtime subscription if needed
            if (message.topic === "streamer_polls" && userRole === "streamer") {
              setupStreamerPollsSubscription(userId, serverSocket);
            }
          }
        }
        // Handle unsubscribe requests
        else if (message.type === "unsubscribe") {
          const connection = connections.get(userId);
          if (connection) {
            connection.subscriptions.delete(message.topic);
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        serverSocket.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    });

    // Handle disconnection
    serverSocket.addEventListener("close", () => {
      // Remove connection from the map
      connections.delete(userId);

      // Clean up any associated resources
      console.log(`WebSocket connection closed for user ${userId}`);
    });

    // Return the WebSocket response
    return response;
  } catch (error) {
    console.error("Error establishing WebSocket connection:", error);
    return new Response(
      JSON.stringify({ error: "Failed to establish WebSocket connection" }),
      { status: 500 }
    );
  }
}

// Initialize Supabase realtime subscription for streamer's polls
async function setupStreamerPollsSubscription(
  streamerId: string,
  socket: WebSocket
) {
  try {
    // Send initial polls data
    const { data: pollsData, error: pollsError } = await supabaseAdmin
      .from("polls")
      .select("*")
      .eq("streamer_id", streamerId)
      .order("created_at", { ascending: false });

    if (!pollsError && pollsData) {
      socket.send(
        JSON.stringify({
          type: "initial",
          polls: pollsData,
        })
      );
    }

    // Set up subscription for poll changes
    const subscription = supabaseAdmin
      .channel("streamer-polls-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "polls",
          filter: `streamer_id=eq.${streamerId}`,
        },
        async (payload) => {
          try {
            if (payload.eventType === "INSERT") {
              // New poll created
              socket.send(
                JSON.stringify({
                  type: "poll_created",
                  poll: payload.new,
                })
              );
            } else if (payload.eventType === "UPDATE") {
              // Poll updated
              socket.send(
                JSON.stringify({
                  type: "update",
                  poll: payload.new,
                })
              );
            } else if (payload.eventType === "DELETE") {
              // Poll deleted
              socket.send(
                JSON.stringify({
                  type: "poll_deleted",
                  pollId: payload.old.id,
                })
              );
            }
          } catch (error) {
            console.error("Error handling poll change:", error);
          }
        }
      )
      .subscribe();

    // Track votes for streamer's polls
    const votesSubscription = supabaseAdmin
      .channel("streamer-votes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `poll_id=in.(${pollsData
            ?.map((poll) => `'${poll.id}'`)
            .join(",")})`,
        },
        async (payload) => {
          try {
            // Get the poll id from the vote
            const pollId = payload.new?.poll_id || payload.old?.poll_id;

            if (pollId) {
              // Get the updated poll with vote counts
              const { data: poll } = await supabaseAdmin
                .from("polls")
                .select("*")
                .eq("id", pollId)
                .single();

              if (poll) {
                // Get vote counts
                const { data: votes } = await supabaseAdmin
                  .from("votes")
                  .select("option_id")
                  .eq("poll_id", pollId);

                // Send updated poll with vote counts
                socket.send(
                  JSON.stringify({
                    type: "update",
                    poll: {
                      ...poll,
                      total_votes: votes?.length || 0,
                      votes_by_option: votes?.reduce((acc, vote) => {
                        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
                        return acc;
                      }, {}),
                    },
                  })
                );
              }
            }
          } catch (error) {
            console.error("Error handling vote change:", error);
          }
        }
      )
      .subscribe();

    // Clean up function for when connection is closed
    socket.addEventListener("close", () => {
      subscription.unsubscribe();
      votesSubscription.unsubscribe();
    });
  } catch (error) {
    console.error("Error setting up streamer polls subscription:", error);
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Failed to set up subscription",
      })
    );
  }
}

// WebSocketPair simulates the WebSocket pair API
class WebSocketPair {
  public readonly socket: WebSocket;
  public readonly response: Response;

  constructor() {
    // This is a simplified implementation for Next.js
    // In a real-world scenario, you'd use a more robust WebSocket implementation
    const { readable, writable } = new TransformStream();
    const socket = new WebSocketImpl(writable);

    this.socket = socket;
    this.response = new Response(readable, {
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
      },
      status: 101, // Switching Protocols
    });
  }
}

// Basic WebSocket implementation to work with Edge Runtime
class WebSocketImpl implements WebSocket {
  private writer: WritableStreamDefaultWriter<any>;
  private eventListeners: Map<string, Set<EventListener>>;
  readyState: number = WebSocket.CONNECTING;
  bufferedAmount: number = 0;
  extensions: string = "";
  protocol: string = "";
  url: string = "";
  binaryType: BinaryType = "blob";
  onopen: ((event: Event) => any) | null = null;
  onmessage: ((event: MessageEvent) => any) | null = null;
  onclose: ((event: CloseEvent) => any) | null = null;
  onerror: ((event: Event) => any) | null = null;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(writable: WritableStream) {
    this.writer = writable.getWriter();
    this.eventListeners = new Map();
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close", { code, reason }));
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.readyState !== WebSocket.OPEN) {
      return;
    }

    // For simplicity, we only support string data in this implementation
    if (typeof data === "string") {
      this.writer.write(data);
    }
  }

  accept(): void {
    this.readyState = WebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  addEventListener(type: string, listener: EventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)?.add(listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    // Handle specific event handlers (onopen, onmessage, etc.)
    const handlerName = `on${event.type}` as keyof WebSocketImpl;
    const handler = this[handlerName] as ((event: Event) => any) | null;
    if (handler) {
      handler.call(this, event);
    }

    // Call all registered event listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener.call(this, event));
    }

    return !event.defaultPrevented;
  }
}
