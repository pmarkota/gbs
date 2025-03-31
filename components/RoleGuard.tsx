"use client";

import { useAuth } from "@/lib/authClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/",
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push(fallbackPath);
    }
  }, [user, isLoading, allowedRoles, fallbackPath, router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // If user is authenticated and has an allowed role, show the children
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Otherwise render nothing (will redirect)
  return null;
}
