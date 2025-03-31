import jwt from "jsonwebtoken";

// Token type
export interface AuthToken {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    rank: number;
    coins: number;
  };
  exp: number;
  iat: number;
}

// Generate a JWT token for a user
export function generateToken(user: {
  id: string;
  email: string;
  username: string;
  role?: string;
  rank?: number;
  coins?: number;
}): string {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "user",
      rank: user.rank || 1,
      coins: user.coins || 100,
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret");
}

// Verify a JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as AuthToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Client-side functions for token management
export const saveToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

// Get current user from token
export const getCurrentUser = (): {
  id: string;
  email: string;
  username: string;
  role: string;
  rank: number;
  coins: number;
} | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as AuthToken;
    if (decoded && decoded.exp * 1000 > Date.now()) {
      return decoded.user;
    }
    // Token expired, remove it
    removeToken();
    return null;
  } catch (error) {
    console.error("Error decoding token:", error);
    removeToken();
    return null;
  }
};
