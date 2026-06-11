'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import {
  fetchGoogleCalendarEvents,
  refreshGoogleAccessToken,
} from '@/lib/google-calendar'
import {
  mergeHouseholdEvents,
  pickNextEventToday,
  type HouseholdScheduleEvent,
} from '@/lib/calendar-merge'
import {
  getHouseholdWeekDateKeys,
  HOUSEHOLD_TZ,
  toHouseholdDateKey,
} from '@/lib/household-dates'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'
import { getGoogleCalendarConfig } from '@/lib/google-calendar'

type ConnectionRow = {
  id: string
  user_id: string
  provider: string
  account_email: string | null
  refresh_token: string
  access_token: string | null
  token_expires_at: string | null
  calendar_id: string
  display_color: string
}

export type GoogleCalendarStatus = {
  configured: boolean
  connected: boolean
  email: string | null
  canConnect: boolean
}

export type TodayScheduleGlance = {
  success: boolean
  nextEvent: HouseholdScheduleEvent | null
  todayCount: number
  connectedMembers: number
  householdMembers: number
  needsConnect: boolean
  error?: string
}

export type WeekScheduleData = {
  success: boolean
  eventsByDate: Record<string, HouseholdScheduleEvent[]>
  connectedMembers: number
  householdMembers: number
  error?: string
}

function weekFetchBounds(): { timeMin: string; timeMax: string } {
  const keys = getHouseholdWeekDateKeys()
  return {
    timeMin: `${keys[0]}T00:00:00`,
    timeMax: `${keys[6]}T23:59:59`,
  }
}

async function getValidGoogleAccessToken(
  admin: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  connection: ConnectionRow
): Promise<string> {
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at).getTime()
    : 0
  const stillValid =
    connection.access_token && expiresAt > Date.now() + 60_000

  if (stillValid && connection.access_token) {
    return connection.access_token
  }

  const refreshed = await refreshGoogleAccessToken(connection.refresh_token)
  const tokenExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000
  ).toISOString()

  await admin
    .from('calendar_connections')
    .update({
      access_token: refreshed.access_token,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id)

  return refreshed.access_token
}

async function fetchHouseholdGoogleEvents(): Promise<{
  events: HouseholdScheduleEvent[]
  connectedMembers: number
  householdMembers: number
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { events: [], connectedMembers: 0, householdMembers: 0, error: 'Not authenticated' }
  }

  const familyId = await resolveFamilyId(supabase, user.id)
  if (!familyId) {
    return { events: [], connectedMembers: 0, householdMembers: 0 }
  }

  const admin = createServiceRoleClient()
  if (!admin) {
    return {
      events: [],
      connectedMembers: 0,
      householdMembers: 0,
      error: 'Server misconfigured',
    }
  }

  const { data: members } = await admin
    .from('family_members')
    .select('user_id, role')
    .eq('family_id', familyId)

  const memberIds = (members ?? []).map((m) => m.user_id)
  if (memberIds.length === 0) {
    return { events: [], connectedMembers: 0, householdMembers: 0 }
  }

  const { data: profiles } = await admin
    .from('profiles')
    .select('user_id, full_name')
    .in('user_id', memberIds)

  const nameByUser = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name || 'Member'])
  )

  const { data: connections } = await admin
    .from('calendar_connections')
    .select(
      'id, user_id, provider, account_email, refresh_token, access_token, token_expires_at, calendar_id, display_color'
    )
    .in('user_id', memberIds)
    .eq('provider', 'google')

  const googleConnections = (connections ?? []) as ConnectionRow[]
  if (googleConnections.length === 0) {
    return {
      events: [],
      connectedMembers: 0,
      householdMembers: memberIds.length,
    }
  }

  const { timeMin, timeMax } = weekFetchBounds()
  const batches: Array<{
    memberUserId: string
    memberName: string
    displayColor: string
    events: Awaited<ReturnType<typeof fetchGoogleCalendarEvents>>
  }> = []

  for (const connection of googleConnections) {
    try {
      const accessToken = await getValidGoogleAccessToken(admin, connection)
      const events = await fetchGoogleCalendarEvents(
        accessToken,
        connection.calendar_id,
        timeMin,
        timeMax,
        HOUSEHOLD_TZ
      )
      batches.push({
        memberUserId: connection.user_id,
        memberName: nameByUser.get(connection.user_id) || 'Member',
        displayColor: connection.display_color,
        events,
      })
    } catch (error) {
      console.error(`Calendar fetch failed for user ${connection.user_id}:`, error)
    }
  }

  return {
    events: mergeHouseholdEvents(batches, HOUSEHOLD_TZ),
    connectedMembers: googleConnections.length,
    householdMembers: memberIds.length,
  }
}

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const configured = Boolean(getGoogleCalendarConfig())

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { configured, connected: false, email: null, canConnect: false }
    }

    const canConnect = await householdHasSharedPlan(supabase, user.id)
    const admin = createServiceRoleClient()
    if (!admin) {
      return { configured, connected: false, email: null, canConnect }
    }

    const { data } = await admin
      .from('calendar_connections')
      .select('account_email')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle()

    return {
      configured,
      connected: Boolean(data),
      email: data?.account_email ?? null,
      canConnect,
    }
  } catch (error) {
    console.error('getGoogleCalendarStatus error:', error)
    return { configured, connected: false, email: null, canConnect: false }
  }
}

export async function getTodayScheduleGlance(): Promise<TodayScheduleGlance> {
  const todayKey = toHouseholdDateKey(new Date())
  const empty: TodayScheduleGlance = {
    success: true,
    nextEvent: null,
    todayCount: 0,
    connectedMembers: 0,
    householdMembers: 0,
    needsConnect: true,
  }

  try {
    const { events, connectedMembers, householdMembers, error } =
      await fetchHouseholdGoogleEvents()

    if (error) {
      return { ...empty, success: false, error }
    }

    const todayEvents = events.filter((e) => e.dateKey === todayKey)
    const nextEvent = pickNextEventToday(events, todayKey)

    return {
      success: true,
      nextEvent,
      todayCount: todayEvents.length,
      connectedMembers,
      householdMembers,
      needsConnect: connectedMembers === 0,
    }
  } catch (error) {
    console.error('getTodayScheduleGlance error:', error)
    return empty
  }
}

export const getCachedTodayScheduleGlance = cache(getTodayScheduleGlance)

export async function getWeekScheduleData(): Promise<WeekScheduleData> {
  const empty: WeekScheduleData = {
    success: true,
    eventsByDate: {},
    connectedMembers: 0,
    householdMembers: 0,
  }

  try {
    const { events, connectedMembers, householdMembers, error } =
      await fetchHouseholdGoogleEvents()

    if (error) {
      return { ...empty, success: false, error }
    }

    const eventsByDate: Record<string, HouseholdScheduleEvent[]> = {}
    for (const event of events) {
      if (!eventsByDate[event.dateKey]) {
        eventsByDate[event.dateKey] = []
      }
      eventsByDate[event.dateKey].push(event)
    }

    return {
      success: true,
      eventsByDate,
      connectedMembers,
      householdMembers,
    }
  } catch (error) {
    console.error('getWeekScheduleData error:', error)
    return empty
  }
}

export const getCachedWeekScheduleData = cache(getWeekScheduleData)
