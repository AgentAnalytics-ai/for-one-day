'use client'

import { HouseholdClock } from '@/components/dashboard/household-clock'
import { useWallMode } from '@/lib/use-wall-mode'

export function TodayHeroClock({ timeZone }: { timeZone: string }) {
  const isWall = useWallMode()
  return <HouseholdClock timeZone={timeZone} compact={isWall} />
}
