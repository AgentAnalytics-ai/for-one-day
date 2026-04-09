import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/** Internal path with no matching route — triggers `app/not-found.tsx` when rewritten. */
const NOT_FOUND_TRIGGER = '/__nf'

function isBlockedDebugRoute(pathname: string): boolean {
  if (pathname === '/debug' || pathname.startsWith('/debug/')) return true
  if (pathname === '/debug-stripe' || pathname.startsWith('/debug-stripe/')) return true
  if (pathname.startsWith('/api/debug')) return true
  return false
}

/**
 * 🛡️ Middleware - runs on every request
 * Auth session refresh + production-only block for debug/diagnostic routes.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (process.env.NODE_ENV === 'production' && isBlockedDebugRoute(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.rewrite(new URL(NOT_FOUND_TRIGGER, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

