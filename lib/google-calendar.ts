/**
 * Google Calendar OAuth + read-only API helpers (server-only).
 */

export const GOOGLE_CALENDAR_READONLY_SCOPE =
  'https://www.googleapis.com/auth/calendar.readonly'

export const GOOGLE_CALENDAR_SCOPES = [
  GOOGLE_CALENDAR_READONLY_SCOPE,
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

export function tokenHasCalendarScope(scope?: string): boolean {
  if (!scope) return false
  return scope.split(/\s+/).includes(GOOGLE_CALENDAR_READONLY_SCOPE)
}

export function getGoogleCalendarRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/calendar/google/callback`
}

export function getGoogleCalendarConfig(): {
  clientId: string
  clientSecret: string
  redirectUri: string
} | null {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret, redirectUri: getGoogleCalendarRedirectUri() }
}

export function buildGoogleCalendarAuthUrl(state: string): string | null {
  const config = getGoogleCalendarConfig()
  if (!config) return null

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export type GoogleTokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type: string
}

export async function exchangeGoogleCodeForTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const config = getGoogleCalendarConfig()
  if (!config) {
    throw new Error('Google Calendar is not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const data = (await response.json()) as GoogleTokenResponse & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || 'Failed to exchange Google authorization code')
  }
  return data
}

export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<GoogleTokenResponse> {
  const config = getGoogleCalendarConfig()
  if (!config) {
    throw new Error('Google Calendar is not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = (await response.json()) as GoogleTokenResponse & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || 'Failed to refresh Google token')
  }
  return data
}

export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | null> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  const data = (await response.json()) as { email?: string }
  return data.email ?? null
}

export type GoogleCalendarListEntry = {
  id: string
  summary: string
  primary?: boolean
  selected?: boolean
}

export type GoogleCalendarEvent = {
  id: string
  title: string
  startsAt: string
  endsAt: string | null
  allDay: boolean
  location: string | null
  htmlLink: string | null
}

/** List calendars the user granted read access to. */
export async function listGoogleCalendars(
  accessToken: string
): Promise<GoogleCalendarListEntry[]> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google calendarList error: ${err.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    items?: Array<{ id: string; summary?: string; primary?: boolean; selected?: boolean }>
  }

  return (data.items ?? []).map((item) => ({
    id: item.id,
    summary: item.summary?.trim() || 'Calendar',
    primary: item.primary,
    selected: item.selected,
  }))
}

/**
 * Primary + Google Contacts birthdays (and similar) for household glance.
 * Anniversaries in Contacts often share the birthdays calendar layer.
 */
export function pickDefaultGoogleCalendarIds(
  calendars: GoogleCalendarListEntry[]
): string[] {
  const ids = new Set<string>()

  const primary = calendars.find((c) => c.primary)
  if (primary) ids.add(primary.id)

  for (const calendar of calendars) {
    const summary = calendar.summary.toLowerCase()
    const isBirthdaysLayer =
      summary.includes('birthday') ||
      calendar.id.includes('addressbook#contacts') ||
      summary.includes('anniversary')
    if (isBirthdaysLayer) {
      ids.add(calendar.id)
    }
  }

  if (ids.size === 0 && calendars[0]) {
    ids.add(calendars[0].id)
  }

  return Array.from(ids)
}

export async function fetchGoogleCalendarsEvents(
  accessToken: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string,
  timeZone?: string
): Promise<GoogleCalendarEvent[]> {
  const merged = new Map<string, GoogleCalendarEvent>()

  for (const calendarId of calendarIds) {
    try {
      const events = await fetchGoogleCalendarEvents(
        accessToken,
        calendarId,
        timeMin,
        timeMax,
        timeZone
      )
      for (const event of events) {
        merged.set(`${calendarId}:${event.id}`, event)
      }
    } catch (error) {
      console.warn(`Google Calendar fetch skipped for ${calendarId}:`, error)
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  )
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
  timeZone?: string
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })
  if (timeZone) {
    params.set('timeZone', timeZone)
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google Calendar API error: ${err.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    items?: Array<{
      id: string
      summary?: string
      htmlLink?: string
      location?: string
      start?: { dateTime?: string; date?: string }
      end?: { dateTime?: string; date?: string }
    }>
  }

  return (data.items ?? [])
    .filter((item) => item.start?.dateTime || item.start?.date)
    .map((item) => {
      const allDay = Boolean(item.start?.date && !item.start?.dateTime)
      const startsAt = item.start?.dateTime ?? `${item.start?.date}T12:00:00.000Z`
      const endsAt = item.end?.dateTime ?? (item.end?.date ? `${item.end.date}T12:00:00.000Z` : null)
      return {
        id: item.id,
        title: item.summary?.trim() || 'Busy',
        startsAt,
        endsAt,
        allDay,
        location: item.location ?? null,
        htmlLink: item.htmlLink ?? null,
      }
    })
}
