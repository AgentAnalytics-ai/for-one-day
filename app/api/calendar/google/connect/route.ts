import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildGoogleCalendarAuthUrl, getGoogleCalendarConfig } from '@/lib/google-calendar'
import { householdHasSharedPlan } from '@/lib/household'

const STATE_COOKIE = 'google_calendar_oauth_state'

export async function GET() {
  const config = getGoogleCalendarConfig()
  if (!config) {
    return NextResponse.redirect(
      new URL('/settings#profile?calendar=unconfigured', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/auth/login?next=/settings%23profile', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    )
  }

  const canConnect = await householdHasSharedPlan(supabase, user.id)
  if (!canConnect) {
    return NextResponse.redirect(
      new URL('/upgrade?calendar=pro', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    )
  }

  const state = randomBytes(24).toString('hex')
  const authUrl = buildGoogleCalendarAuthUrl(state)
  if (!authUrl) {
    return NextResponse.redirect(
      new URL('/settings#profile?calendar=unconfigured', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    )
  }

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
