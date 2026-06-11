import type { TodayScheduleGlance } from '@/app/actions/calendar-actions'

/** Show schedule on Today only when there is something worth a glance. */
export function shouldShowScheduleOnToday(
  glance: TodayScheduleGlance | null
): boolean {
  if (!glance?.success) return false
  if (glance.needsConnect) return true
  if (glance.nextEvent) return true
  if (glance.todayCount > 0) return true
  return false
}
