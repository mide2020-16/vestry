import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = pathname === "/admin/login" || pathname === "/admin/signup" || pathname === "/admin/genesis";
  const isAdminPage = pathname.startsWith("/admin");

  // Redirect unauthenticated users to login (except public pages)
  if (isAdminPage && !isPublicAdminPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Redirect logged-in users away from login page
  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
