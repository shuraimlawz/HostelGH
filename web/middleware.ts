import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

    if (!token && !isAuthPage) {
        // For MVP we handle token in localStorage/cookies
        // This is a simplified middleware for redirection logic
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/tenant/:path*', '/owner/:path*', '/admin/:path*'],
};
