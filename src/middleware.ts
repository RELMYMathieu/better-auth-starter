import { isPublicPath } from "@/lib/public-paths";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/config";
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  if (pathname === "/auth/logout") {
    return NextResponse.next();
  }

  if (sessionCookie && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
