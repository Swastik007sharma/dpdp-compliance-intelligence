import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Better Auth stores sessions in cookies: better-auth.session_token or __Secure-better-auth.session_token
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/regulatory") ||
    pathname.startsWith("/findings") ||
    pathname.startsWith("/actions") ||
    pathname.startsWith("/settings");

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/inventory/:path*",
    "/documents/:path*",
    "/regulatory/:path*",
    "/findings/:path*",
    "/actions/:path*",
    "/settings/:path*",
  ],
};
