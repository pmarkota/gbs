"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { saveToken, removeToken, getCurrentUser } from "./auth";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  rank: number;
  coins: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing token and set user on mount
  useEffect(() => {
    const checkAuth = () => {
      const userData = getCurrentUser();
      if (userData) {
        setUser(userData);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login functionality
  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Save token to localStorage
        saveToken(data.token);
        setUser(data.user);
        router.push("/");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Register functionality
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Save token to localStorage for automatic login
        saveToken(data.token);
        setUser(data.user);
        router.push("/");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Logout functionality
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push("/auth");
  }, [router]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
