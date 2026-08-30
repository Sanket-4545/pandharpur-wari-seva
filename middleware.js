import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/auth";
import { verifyVolunteerToken, VOLUNTEER_COOKIE_NAME } from "./lib/volunteer-auth";

const ADMIN_ONLY_API_PREFIXES = [
  "/api/admins",
  "/api/help-requests",
  "/api/settings",
  "/api/reports",
  "/api/analytics-events",
  "/api/db",
  "/api/dashboard",
];

const MIXED_API_PREFIXES = [
  "/api/missing-persons",
  "/api/lost-items",
  "/api/announcements",
  "/api/emergency-contacts",
  "/api/gallery-images",
  "/api/services",
  "/api/faq",
  "/api/timeline-stops",
  "/api/volunteers",
  "/api/contact-messages",
];

const PUBLIC_ONLY_METHODS = ["GET", "HEAD", "OPTIONS"];

const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function isWriteMethod(method) {
  return WRITE_METHODS.includes(method);
}

function matchesAnyPrefix(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const token = sessionCookie?.value;
  const payload = token ? await verifyToken(token) : null;

  const isAuthenticated = !!payload;

  const volSessionCookie = request.cookies.get(VOLUNTEER_COOKIE_NAME);
  const volToken = volSessionCookie?.value;
  const volPayload = volToken ? await verifyVolunteerToken(volToken) : null;

  const isVolunteerAuthenticated = !!volPayload;

  // Public auth endpoints — always allow
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Volunteer page routes — require volunteer auth, redirect to volunteer login
  if (pathname.startsWith("/volunteer")) {
    // Allow /volunteer/login without auth to prevent redirect loop
    if (pathname === "/volunteer/login" || pathname === "/volunteer/login/") {
      return NextResponse.next();
    }
    if (!isVolunteerAuthenticated) {
      const loginUrl = new URL("/volunteer/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Admin page routes — require auth, redirect to login
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Volunteer API routes — authentication is enforced authoritatively by
  // requireVolunteerAuth() inside each API route (Node runtime), which also
  // enforces active/approved status and VOLUNTEER_DEACTIVATED handling.
  // Middleware must not reject these requests, so the API route can run.
  if (pathname.startsWith("/api/volunteer/")) {
    return NextResponse.next();
  }

  // Admin-only API routes — require auth
  if (matchesAnyPrefix(pathname, ADMIN_ONLY_API_PREFIXES)) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Mixed public/admin API routes
  if (matchesAnyPrefix(pathname, MIXED_API_PREFIXES)) {
    // Volunteers: only POST (registration) is public, everything requires auth
    if (pathname === "/api/volunteers") {
      if (method === "POST") {
        return NextResponse.next();
      }
      if (!isAuthenticated) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Public contact form POST must remain accessible
    if (pathname === "/api/contact-messages" && method === "POST") {
      return NextResponse.next();
    }

    // Public GET/HEAD/OPTIONS remain accessible for other mixed APIs
    if (PUBLIC_ONLY_METHODS.includes(method)) {
      return NextResponse.next();
    }

    // Write operations require auth
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // All other routes — allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/volunteer/:path*",
    "/api/:path*",
  ],
};
