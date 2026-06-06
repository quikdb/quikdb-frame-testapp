import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

// Paths that require authentication
const PROTECTED_PATHS = [
  "/api/v1/tasks",
  "/api/v1/users",
  "/api/v1/stats",
];

// Paths that are always public
const PUBLIC_PATHS = ["/api/v1/auth/login", "/api/health"];

export function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname, method } = request.nextUrl;

  // --- Rate Limiting ---
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (pathname.startsWith("/api/")) {
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rl.resetAt),
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // --- Auth Check for API Routes ---
  if (pathname.startsWith("/api/v1/")) {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!isPublic) {
      const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
      if (isProtected) {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }
        // Actual token verification happens in the route handlers
        // Middleware just ensures the header exists
      }
    }
  }

  // --- Request Logger ---
  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${method} ${pathname} — ${duration}ms — IP: ${ip}`
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
