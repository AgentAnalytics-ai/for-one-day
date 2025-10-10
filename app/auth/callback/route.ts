import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * 🔗 Auth callback handler
 * Exchanges auth code for session and redirects
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(`${origin}/dashboard`)
}

