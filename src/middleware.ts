import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/battle", "/leaderboard", "/guild", "/profile"];
const authRoutes = ["/login", "/signup"];

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Note: Depending on the specific better-auth setup, we check the session from the request headers
    // For a robust check without custom DB, we'll use standard cookie parsing or the library's utility

    const isProtected = protectedRoutes.some(route => path.startsWith(route));
    const isAuthRoute = authRoutes.some(route => path.startsWith(route));

    // Check for real BetterAuth session tokens only
    const hasSession = request.cookies.has("better-auth.session_token") ||
        request.cookies.has("__Secure-better-auth.session_token") ||
        request.cookies.has("session_token");

    if (isProtected && !hasSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthRoute && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
