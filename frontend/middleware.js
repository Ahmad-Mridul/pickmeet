import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const middleware = async (req) => {
    const token = await getToken({ req });
    const isTokenOk = Boolean(token);
    const { pathname } = req.nextUrl;

    // Exclude static files, next internals, login page, and api routes from protection
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    if (!isTokenOk) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};