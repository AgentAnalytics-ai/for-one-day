import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  acceptHouseholdInvitation,
  acceptPendingHouseholdInvitation,
} from '@/app/actions/household-actions'

/**
 * 🔗 Auth callback handler
 * Exchanges auth code for session and redirects
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const inviteToken = requestUrl.searchParams.get('invite_token')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (inviteToken?.trim()) {
    await acceptHouseholdInvitation(inviteToken.trim())
  } else {
    await acceptPendingHouseholdInvitation()
  }

  const params = new URLSearchParams()
  params.set('welcome', '1')
  if (inviteToken) params.set('joined', 'household')
  return NextResponse.redirect(`${origin}/dashboard?${params.toString()}`)
}

