
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Define Protective Boundaries
const PROTECTED_ROUTES = [
    '/dashboard',
    '/search',
    '/marketplace',
    '/shipments',
    '/profile',
    '/settings'
]

const AUTH_ROUTES = [
    '/login',
    '/signup'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 2. Check for Auth Token (We look for 'token' in cookies OR localStorage helper)
    // NOTE: Middleware can only read cookies. Client-side localStorage is invisible to Middleware.
    // To make this "World Best", we really should be using Cookies.
    // However, for immediate "Guard" logic without rewriting the entire Auth stack to Cookies-only:
    // We will trust the Client-Side Check in AuthContext for now, OR we can implement a logic.

    // WAIT. The user wants "Best Logic". The Best Logic IS Cookies.
    // But let's check if we have a cookie.
    // If we don't, we can't strictly enforce in Middleware *unless* we switched to Cookies.

    // STRATEGY: Hybrid.
    // We permit the request, but the Page Components are wrapped in AuthGuard.
    // OR, we check for a cookie named 'auth_token'.

    // Let's assume for "Best Logic" we want to enforce presence of 'token'.
    // Since our current Login (previous steps) used `localStorage.setItem`, Middleware CANNOT see it.

    // CRITICAL PIVOT:
    // To make Middleware work, we MUST set a cookie on Login.
    // I will rely on the Client Components to redirect for now, 
    // BUT I will add a strict check for the "token" cookie if it exists.

    const token = request.cookies.get('token')?.value

    // 3. Logic: If trying to access Protected Route AND no token
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        if (!token) {
            // Redirect to Login
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 4. Logic: If already logged in, don't show Login page
    if (AUTH_ROUTES.includes(pathname)) {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

// 5. Config
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/search/:path*',
        '/marketplace/:path*',
        '/shipments/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/login',
        '/signup'
    ]
}
