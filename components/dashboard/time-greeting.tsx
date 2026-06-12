'use client'

import { HouseholdClock } from '@/components/dashboard/household-clock'
import { FALLBACK_HOUSEHOLD_TZ } from '@/lib/household-timezone'

type TimeGreetingProps = {
  timeZone?: string
}

/** @deprecated Prefer HouseholdClock with household timezone on Today. */
export function TimeGreeting({ timeZone = FALLBACK_HOUSEHOLD_TZ }: TimeGreetingProps) {
  return <HouseholdClock timeZone={timeZone} />
}
