'use client'

import { useEffect, useState } from 'react'
import {
  greetingForHour,
  hourInTimezone,
  timezoneLabel,
} from '@/lib/household-timezone'

type HouseholdClockProps = {
  timeZone: string
}

/**
 * Single kitchen-wall clock — greeting, date, and time in the household timezone.
 * Client-only tick avoids SSR UTC vs local mismatch.
 */
export function HouseholdClock({ timeZone }: HouseholdClockProps) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) {
    return (
      <div className="min-h-[4.5rem]" aria-hidden>
        <div className="page-title mx-auto h-9 max-w-[12rem] animate-pulse rounded-lg bg-[#E7E2DA]/60" />
        <div className="mx-auto mt-2 h-5 max-w-[10rem] animate-pulse rounded bg-[#E7E2DA]/40" />
      </div>
    )
  }

  const hour = hourInTimezone(now, timeZone)
  const greeting = greetingForHour(hour)
  const dateString = now.toLocaleDateString('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const timeString = now.toLocaleString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <>
      <h1 className="page-title text-balance text-slate-900">{greeting}</h1>
      <p className="mt-1 text-base text-slate-600 md:text-lg md:text-slate-500">{dateString}</p>
      <p className="text-sm font-medium tabular-nums text-[#5C6478]">{timeString}</p>
      <p className="sr-only">Home timezone: {timezoneLabel(timeZone)}</p>
    </>
  )
}
