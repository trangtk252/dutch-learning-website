import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic auth check: send visitors without a session cookie to /login.
 * The real authorization check happens server-side in every page and action
 * (lib/session.ts); this only avoids rendering protected pages needlessly.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/onboarding/:path*", "/vocabulary/:path*", "/speaking/:path*",
    "/listening/:path*", "/reading/:path*", "/writing/:path*", "/grammar/:path*", "/nt2/:path*",
    "/mistakes/:path*", "/progress/:path*", "/settings/:path*", "/search/:path*", "/admin/:path*",
    "/practice/:path*", "/more/:path*",
  ],
};
