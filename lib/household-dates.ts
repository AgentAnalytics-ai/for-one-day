/** Household calendar day keys (YYYY-MM-DD) in the home timezone. */
export const HOUSEHOLD_TZ =
  process.env.NEXT_PUBLIC_HOUSEHOLD_TIMEZONE ?? 'America/Chicago'

export function toHouseholdDateKey(date: Date, timeZone = HOUSEHOLD_TZ): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/** Sunday-start week of date keys in household timezone. */
export function getHouseholdWeekDateKeys(anchor = new Date(), timeZone = HOUSEHOLD_TZ): string[] {
  const todayKey = toHouseholdDateKey(anchor, timeZone)
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(anchor)
  const dayOffset = WEEKDAY_INDEX[weekday] ?? 0
  const [year, month, day] = todayKey.split('-').map(Number)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1, day - dayOffset + i, 12, 0, 0))
    return toHouseholdDateKey(d, timeZone)
  })
}

export type HouseholdWeekDay = {
  dateKey: string
  weekday: string
  weekdayShort: string
  dateNum: number
  isToday: boolean
  isPast: boolean
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: n('year'),
    month: n('month'),
    day: n('day'),
    hour: n('hour'),
    minute: n('minute'),
    second: n('second'),
  }
}

/** RFC3339 instant for start or end of a household calendar day (Google Calendar API). */
export function householdDayRfc3339(
  dateKey: string,
  boundary: 'start' | 'end',
  timeZone = HOUSEHOLD_TZ
): string {
  const [y, mo, d] = dateKey.split('-').map(Number)
  const hour = boundary === 'start' ? 0 : 23
  const minute = boundary === 'start' ? 0 : 59
  const second = boundary === 'start' ? 0 : 59

  let guess = Date.UTC(y, mo - 1, d, hour, minute, second)
  for (let i = 0; i < 4; i++) {
    const parts = zonedParts(new Date(guess), timeZone)
    const target = Date.UTC(y, mo - 1, d, hour, minute, second)
    const actual = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    guess += target - actual
  }

  return new Date(guess).toISOString()
}

export function buildHouseholdWeekDays(anchor = new Date(), timeZone = HOUSEHOLD_TZ): HouseholdWeekDay[] {
  const todayKey = toHouseholdDateKey(anchor, timeZone)
  const keys = getHouseholdWeekDateKeys(anchor, timeZone)

  return keys.map((dateKey) => {
    const [y, m, d] = dateKey.split('-').map(Number)
    const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    return {
      dateKey,
      weekday: new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(noon),
      weekdayShort: new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(noon),
      dateNum: d,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    }
  })
}

/** Today and future days in the household week — hide past from wall glance. */
export function upcomingHouseholdWeekDays<D extends { dateKey: string; isPast?: boolean }>(
  days: D[]
): D[] {
  return days.filter((d) => !d.isPast)
}
