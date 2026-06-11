import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import {
  exchangeGoogleCodeForTokens,
  fetchGoogleAccountEmail,
  listGoogleCalendars,
  pickDefaultGoogleCalendarIds,
} from '@/lib/google-calendar'
import { pickMemberColor } from '@/lib/calendar-merge'

const STATE_COOKIE = 'google_calendar_oauth_state'

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectError = (code: string) =>
    NextResponse.redirect(new URL(`/settings#profile?calendar=${code}`, siteUrl))

  const url = new URL(request.url)
  const error = url.searchParams.get('error')
  if (error) {
    return redirectError('denied')
  }

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieState = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split('=')[1]

  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectError('invalid')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', siteUrl))
  }

  const admin = createServiceRoleClient()
  if (!admin) {
    return redirectError('server')
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code)

    const { data: existing } = await admin
      .from('calendar_connections')
      .select('refresh_token, display_color')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle()

    const refreshToken = tokens.refresh_token ?? existing?.refresh_token
    if (!refreshToken) {
      return redirectError('no_refresh')
    }

    const email = await fetchGoogleAccountEmail(tokens.access_token)
    const tokenExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString()

    const displayColor = existing?.display_color ?? pickMemberColor(0)

    let calendarIds = ['primary']
    try {
      const calendars = await listGoogleCalendars(tokens.access_token)
      calendarIds = pickDefaultGoogleCalendarIds(calendars)
    } catch (listError) {
      console.error('Google calendarList on connect:', listError)
    }

    const { error: upsertError } = await admin.from('calendar_connections').upsert(
      {
        user_id: user.id,
        provider: 'google',
        account_email: email,
        refresh_token: refreshToken,
        access_token: tokens.access_token,
        token_expires_at: tokenExpiresAt,
        calendar_id: calendarIds[0] ?? 'primary',
        calendar_ids: calendarIds,
        display_color: displayColor,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    )

    if (upsertError) {
      console.error('calendar_connections upsert:', upsertError)
      return redirectError('save')
    }

    revalidatePath('/dashboard')
    revalidatePath('/week')

    const response = NextResponse.redirect(
      new URL('/settings#profile?calendar=connected', siteUrl)
    )
    response.cookies.set(STATE_COOKIE, '', { maxAge: 0, path: '/' })
    return response
  } catch (err) {
    console.error('Google calendar callback error:', err)
    return redirectError('exchange')
  }
}
