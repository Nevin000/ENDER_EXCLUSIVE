import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");

  const isLocalhost =
    host?.includes("localhost") ||
    host?.includes("127.0.0.1") ||
    host?.includes("[::1]");

  // HTTPS redirect ONLY for real production domains
  if (
    process.env.NODE_ENV === "production" &&
    proto === "http" &&
    host &&
    !isLocalhost
  ) {
    const httpsUrl = new URL(`https://${host}${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(httpsUrl, 301);
  }

  const response = NextResponse.next();

  // ⚠️ HSTS header ONLY for non-localhost
  if (!isLocalhost) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains"
    );
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // ✅ Content Security Policy — allows Google Maps, Firebase, Cloudinary
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://www.google.com https://maps.google.com https://*.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://firebasestorage.googleapis.com https://res.cloudinary.com https://*.cloudinary.com https://*.googleusercontent.com https://*.firebaseapp.com https://maps.gstatic.com https://maps.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://api.cloudinary.com https://maps.googleapis.com",
    "frame-src 'self' https://*.firebaseapp.com https://www.google.com https://maps.google.com https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isLocalhost) {
    cspDirectives.push("upgrade-insecure-requests");
  }

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};