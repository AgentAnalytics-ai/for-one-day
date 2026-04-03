import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Production-safe API guards (defense in depth on top of RLS and auth).
 * Diagnostic and test routes should never be anonymously callable on deployed URLs.
 */

/** Minimum length so weak secrets are rejected in production. */
const MIN_ADMIN_SECRET_LEN = 24

/**
 * Blocks handlers when running a production build (`next start`, Vercel).
 * Local development uses `next dev` → NODE_ENV=development.
 */
export function blockInProduction(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return null
}

/**
 * Internal admin / ops APIs (subscription repair, Stripe sync).
 * Requires ADMIN_API_SECRET via Authorization: Bearer <secret> or x-admin-secret.
 */
export function requireAdminApiSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_API_SECRET
  if (!secret || secret.length < MIN_ADMIN_SECRET_LEN) {
    return NextResponse.json(
      { error: 'Admin API not configured' },
      { status: 503 }
    )
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  const header = request.headers.get('x-admin-secret')?.trim()
  const token = bearer || header

  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
