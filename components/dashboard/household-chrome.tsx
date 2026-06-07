'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import type { HouseholdSettings } from '@/app/actions/household-actions'
import { cn } from '@/lib/utils'

function planLabel(plan: HouseholdSettings['plan']): string {
  if (plan === 'lifetime') return 'Lifetime'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

function planStyles(plan: HouseholdSettings['plan']): string {
  if (plan === 'lifetime') return 'bg-amber-50 text-amber-900 ring-amber-200/80'
  if (plan === 'pro') return 'bg-primary-50 text-primary-900 ring-primary-200/80'
  return 'bg-slate-100 text-slate-600 ring-slate-200/80'
}

interface HouseholdChromeProps {
  household: HouseholdSettings | null
  variant?: 'bar' | 'inline'
  className?: string
}

/**
 * Persistent household context — which home you're in (Step 4 polish).
 * Links to Settings; does not replace Today/memories content.
 */
export function HouseholdChrome({
  household,
  variant = 'bar',
  className,
}: HouseholdChromeProps) {
  if (!household) return null

  const memberLabel =
    household.members.length === 1
      ? '1 member'
      : `${household.members.length} members`

  if (variant === 'inline') {
    return (
      <Link
        href="/settings#household"
        className={cn(
          'inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-left transition-colors hover:bg-slate-50',
          className
        )}
      >
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
            planStyles(household.plan)
          )}
        >
          {planLabel(household.plan)}
        </span>
        <span className="truncate text-sm font-medium text-slate-700">
          {household.name}
        </span>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'border-b border-slate-200/80 bg-white/95 backdrop-blur',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/settings#household"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 transition-colors hover:bg-slate-50 sm:gap-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-200/80">
            <Home className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Your household
            </span>
            <span className="block truncate text-sm font-semibold text-slate-900">
              {household.name}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:inline">{memberLabel}</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
              planStyles(household.plan)
            )}
          >
            {planLabel(household.plan)}
          </span>
        </div>
      </div>
    </div>
  )
}
