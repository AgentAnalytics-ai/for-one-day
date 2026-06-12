'use client'

import { useState, useTransition } from 'react'
import { setHouseholdTimezone } from '@/app/actions/household-actions'
import {
  guessBrowserTimezone,
  HOME_TIMEZONE_OPTIONS,
  timezoneLabel,
} from '@/lib/household-timezone'

type HouseholdTimezonePromptProps = {
  /** True when DB timezone was never confirmed (legacy backfill still counts as set). */
  show: boolean
  /** Single-row layout for kitchen wall — saves vertical space. */
  compact?: boolean
}

export function HouseholdTimezonePrompt({ show, compact = false }: HouseholdTimezonePromptProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const guess = guessBrowserTimezone()

  if (!show || dismissed) return null

  const handleConfirm = (timeZone: string) => {
    startTransition(async () => {
      const result = await setHouseholdTimezone(timeZone)
      if (result.success) setDismissed(true)
    })
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-200 bg-primary-50/90 px-3 py-2 text-sm text-primary-900">
        <p className="min-w-0 flex-1 text-xs sm:text-sm">
          <span className="font-medium">Home clock:</span>{' '}
          <span className="text-[#5C6478]">{timezoneLabel(guess)}?</span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleConfirm(guess)}
            className="rounded-full bg-primary-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-950 disabled:opacity-50"
          >
            Yes
          </button>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full border border-[#E7E2DA] bg-white px-3 py-1.5 text-xs font-medium text-[#5C6478]">
              Other
            </summary>
            <div className="absolute right-0 z-10 mt-1 min-w-[10rem] rounded-xl border border-[#E7E2DA] bg-white p-2 shadow-lg">
              {HOME_TIMEZONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConfirm(opt.value)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#FAF7F2]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-primary-900">
      <p className="font-medium">Set your home clock</p>
      <p className="mt-1 text-[#5C6478]">
        Today uses one timezone for your kitchen wall — is this{' '}
        <span className="font-medium text-primary-900">{timezoneLabel(guess)}</span>?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleConfirm(guess)}
          className="rounded-full bg-primary-900 px-4 py-2 text-xs font-medium text-white hover:bg-primary-950 disabled:opacity-50"
        >
          Yes, use {timezoneLabel(guess)}
        </button>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-full border border-[#E7E2DA] bg-white px-4 py-2 text-xs font-medium text-[#5C6478] hover:border-[#D4CFC6]">
            Pick another
          </summary>
          <div className="absolute left-0 z-10 mt-2 min-w-[10rem] rounded-xl border border-[#E7E2DA] bg-white p-2 shadow-lg">
            {HOME_TIMEZONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isPending}
                onClick={() => handleConfirm(opt.value)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#FAF7F2]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}
