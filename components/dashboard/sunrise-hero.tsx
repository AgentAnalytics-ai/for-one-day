'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'

type Tier = 'free' | 'pro' | 'lifetime'

interface SunriseHeroProps {
  plan: Tier | null | undefined
}

/**
 * SunriseHero
 * Animated "new day" band at the top of the dashboard.
 * Plays a gentle sunrise once on mount, then stays still.
 */
export function SunriseHero({ plan }: SunriseHeroProps) {
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Trigger a one-time animation when the component mounts
    const id = window.setTimeout(() => setHasAnimated(true), 30)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <section className="mb-6 md:mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-100/80 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
        {/* Horizon backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-x-[-10%] bottom-0 h-24 bg-gradient-to-t from-slate-200/80 via-slate-100/40 to-transparent" />
        </div>

        <div className="relative flex flex-col items-center gap-3 text-center">
          {/* Animated sun motif */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200 transition-all duration-800 ease-out ${
                hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              <SunMotif className="h-8 w-auto" />
            </div>
          </div>

          {/* Greeting + subscription */}
          <div className="flex flex-col items-center gap-2">
            <TimeGreeting />
            <SubscriptionBadge tier={plan || 'free'} />
          </div>
        </div>
      </div>
    </section>
  )
}

