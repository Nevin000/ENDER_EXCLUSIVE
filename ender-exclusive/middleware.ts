import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");

  // Force HTTP to HTTPS redirect in production environments behind reverse proxies (Railway/Vercel)
  if (process.env.NODE_ENV === "production" && proto === "http" && host) {
    const httpsUrl = new URL(`https://${host}${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(httpsUrl, 301);
  }

  const response = NextResponse.next();

  // Set transport & security headers on edge responses
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, _next, favicon, and public images
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
