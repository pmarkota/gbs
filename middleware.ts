import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth",
  "/about",
  "/affiliates",
  "/blog",
  "/support",
];

// This middleware doesn't do authentication anymore, since we're using localStorage
// which isn't accessible from middleware. Instead, authenticate in client components
// or in API routes. This middleware now only handles redirects for public paths.
export function middleware(request: NextRequest) {
  // No need to check authentication in middleware since we're using client-side auth
  // with localStorage. API endpoints will handle their own auth verification.

  // If we want to prevent non-JavaScript clients from accessing protected routes,
  // we'd need a different approach, like storing a session cookie alongside localStorage.

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply only to API routes that need auth
    "/api/((?!auth).*)",
  ],
};
