import type { SupabaseClient } from '@supabase/supabase-js'

/** Fallback when household row has no timezone (env or Central). */
export const FALLBACK_HOUSEHOLD_TZ =
  process.env.NEXT_PUBLIC_HOUSEHOLD_TIMEZONE ?? 'America/Chicago'

export const HOME_TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'America/New_York', label: 'Eastern' },
  { value: 'America/Chicago', label: 'Central' },
  { value: 'America/Denver', label: 'Mountain' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
]

export function isValidIanaTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

export function normalizeHouseholdTimezone(timeZone: string | null | undefined): string | null {
  const tz = timeZone?.trim()
  if (!tz || !isValidIanaTimezone(tz)) return null
  return tz
}

export function timezoneLabel(timeZone: string): string {
  const match = HOME_TIMEZONE_OPTIONS.find((o) => o.value === timeZone)
  if (match) return match.label
  return timeZone.replace(/_/g, ' ')
}

export function guessBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && isValidIanaTimezone(tz)) return tz
  } catch {
    /* ignore */
  }
  return FALLBACK_HOUSEHOLD_TZ
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function hourInTimezone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  return Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
}

export async function resolveHouseholdTimezone(
  supabase: SupabaseClient,
  familyId: string
): Promise<string> {
  const { data } = await supabase
    .from('families')
    .select('timezone')
    .eq('id', familyId)
    .maybeSingle()

  return normalizeHouseholdTimezone(data?.timezone) ?? FALLBACK_HOUSEHOLD_TZ
}

export async function householdTimezoneIsUnset(
  supabase: SupabaseClient,
  familyId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('families')
    .select('timezone')
    .eq('id', familyId)
    .maybeSingle()

  return !normalizeHouseholdTimezone(data?.timezone)
}
