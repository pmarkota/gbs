"use client";

import { useAuth } from "./authClient";

export function useUserRole() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) =>
      user?.role ? roles.includes(user.role) : false,
  };
}
