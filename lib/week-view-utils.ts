import type { HouseholdWeekDay } from '@/lib/household-dates'
import { upcomingHouseholdWeekDays } from '@/lib/household-dates'

type WeekDayLike = HouseholdWeekDay & { meal?: unknown }

/** Human label for the visible meal-planning window (e.g. “Fri 12 – Sat 13”). */
export function formatUpcomingWeekRange(days: HouseholdWeekDay[]): string | null {
  if (days.length === 0) return null
  if (days.length === 1) {
    const d = days[0]
    return `${d.weekday}, ${d.weekdayShort} ${d.dateNum}`
  }
  const first = days[0]
  const last = days[days.length - 1]
  return `${first.weekdayShort} ${first.dateNum} – ${last.weekdayShort} ${last.dateNum}`
}

/** Plain-language window — not “2 days”, but tonight through end of week. */
export function formatAheadWindowLabel(days: HouseholdWeekDay[]): string {
  if (days.length === 0) return 'This week'
  if (days.length === 1) {
    return days[0].isToday ? 'Tonight only' : `Planning for ${days[0].weekday}`
  }
  const last = days[days.length - 1]
  return days[0].isToday
    ? `Tonight through ${last.weekday}`
    : `${days[0].weekday} through ${last.weekday}`
}

export function splitWeekDaysForView<T extends WeekDayLike>(days: T[]) {
  const upcomingDays = upcomingHouseholdWeekDays(days)
  const pastCount = days.length - upcomingDays.length
  return { allDays: days, upcomingDays, pastCount }
}
