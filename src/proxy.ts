import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Exclude ignored paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files like favicon.ico, images
    ) {
        return NextResponse.next();
    }

    const authCookie = request.cookies.get('auth-storage');
    let isAuthenticated = false;

    if (authCookie) {
        try {
            const parsed = JSON.parse(authCookie.value);
            // Check if state.user exists in the zustand persisted store
            if (parsed?.state?.user) {
                isAuthenticated = true;
            }
        } catch (e) {
            // ignore parse error logic
        }
    }

    // If on auth page and authenticated -> redirect to dashboard
    if (pathname.startsWith('/auth') && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If not on auth page and NOT authenticated -> redirect to auth
    if (!pathname.startsWith('/auth') && !isAuthenticated) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Root path -> redirect to dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
