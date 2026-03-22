import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Decodes the JWT payload (base64url) without verifying the signature.
 * Signature verification is the backend's job. Here we only need the role claim
 * to decide whether to serve the admin page at all.
 */
function getJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        // base64url → base64
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch {
        return null
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Only runs for /admin and any sub-paths
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')?.value

    // No token at all → 404 (admin panel doesn't exist as far as they know)
    if (!token) {
        return new NextResponse(null, { status: 404 })
    }

    const payload = getJwtPayload(token)

    // Expired token check
    if (!payload || (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000)) {
        return new NextResponse(null, { status: 404 })
    }

    // Not admin role → 404 (not redirect — redirect reveals the page exists)
    if (payload.role !== 'admin') {
        return new NextResponse(null, { status: 404 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/admin'],
}
