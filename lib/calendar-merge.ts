import type { GoogleCalendarEvent } from '@/lib/google-calendar'

export type HouseholdScheduleEvent = {
  id: string
  title: string
  startsAt: string
  endsAt: string | null
  allDay: boolean
  location: string | null
  htmlLink: string | null
  memberUserId: string
  memberName: string
  displayColor: string
  dateKey: string
  timeLabel: string
}

const DISPLAY_COLORS = ['#1e3a5f', '#b45309', '#047857', '#7c3aed', '#be123c']

export function pickMemberColor(index: number): string {
  return DISPLAY_COLORS[index % DISPLAY_COLORS.length]
}

export function formatEventTimeLabel(startsAt: string, allDay: boolean, timeZone: string): string {
  if (allDay) return 'All day'
  const date = new Date(startsAt)
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function toEventDateKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso))
}

export function mergeHouseholdEvents(
  batches: Array<{
    memberUserId: string
    memberName: string
    displayColor: string
    events: GoogleCalendarEvent[]
  }>,
  timeZone: string
): HouseholdScheduleEvent[] {
  const merged: HouseholdScheduleEvent[] = []

  for (const batch of batches) {
    for (const event of batch.events) {
      merged.push({
        id: `${batch.memberUserId}:${event.id}`,
        title: event.title,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        allDay: event.allDay,
        location: event.location,
        htmlLink: event.htmlLink,
        memberUserId: batch.memberUserId,
        memberName: batch.memberName,
        displayColor: batch.displayColor,
        dateKey: toEventDateKey(event.startsAt, timeZone),
        timeLabel: formatEventTimeLabel(event.startsAt, event.allDay, timeZone),
      })
    }
  }

  return merged.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  )
}

export function pickNextEventToday(
  events: HouseholdScheduleEvent[],
  todayKey: string,
  now = new Date()
): HouseholdScheduleEvent | null {
  const todayEvents = events.filter((e) => e.dateKey === todayKey)
  const upcoming = todayEvents.filter((e) => new Date(e.endsAt ?? e.startsAt) >= now)
  return upcoming[0] ?? todayEvents[todayEvents.length - 1] ?? null
}
