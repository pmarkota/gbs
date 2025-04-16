"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/useUserRole";
import Sidebar from "@/components/streamer/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/authClient";

// Protected Streamer component that uses useAuth inside AuthProvider
function StreamerLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isStreamer } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isStreamer) {
      router.push("/");
    }
  }, [isLoading, isStreamer, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-t-purple-500 border-b-indigo-500 border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-t-pink-500 border-b-fuchsia-500 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
        </div>
      </div>
    );
  }

  if (!user || !isStreamer) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

// Main layout wrapper that provides AuthProvider
export default function StreamerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <StreamerLayoutContent>{children}</StreamerLayoutContent>
    </AuthProvider>
  );
}
