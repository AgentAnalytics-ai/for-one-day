'use client'

import { useEffect, useState } from 'react'
import { NavPillLogo } from '@/components/brand/nav-pill-logo'
import { cn } from '@/lib/utils'

/**
 * Marketing tablet mock — matches real dashboard chrome (logo top-center).
 */
export function KitchenWallPreview({ className }: { className?: string }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 120)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div
      className={cn(
        'kitchen-wall--animate mx-auto w-full max-w-[440px]',
        ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        'transition-all duration-700 ease-out',
        className
      )}
      aria-hidden
    >
      <div className="rounded-[28px] border border-[#E7E2DA] bg-[#1a1a1a] p-3 shadow-[0_24px_64px_rgba(16,42,67,0.18)]">
        <div className="overflow-hidden rounded-[20px] bg-[#FAF7F2]">
          {/* Dashboard chrome — logo is the hero */}
          <div className="border-b border-[#E7E2DA] bg-white px-3 py-3">
            <div className="surface-card mx-auto max-w-full px-2 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 gap-1">
                  {(['Today', 'Lists', 'Week'] as const).map((tab) => (
                    <span
                      key={tab}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                        tab === 'Today'
                          ? 'kw-tab-active bg-primary-900 text-white'
                          : 'text-[#5C6478]'
                      )}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <span className="h-7 w-7 shrink-0 rounded-full bg-[#F3EDE4]" />
              </div>

              <div className="mt-2 flex flex-col items-center gap-1 border-t border-[#F0EBE3] pt-2">
                <NavPillLogo size="compact" />
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-800">
                    Pro
                  </span>
                  <span className="truncate text-[10px] font-medium text-[#5C6478]">
                    Decker Family
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today body */}
          <div className="space-y-4 px-5 py-5">
            <p className="text-center text-xs font-medium text-[#5C6478]">
              Sunday, June 7 · 2:34 PM
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="kw-card-schedule surface-card p-4">
                <p className="section-label mb-1">Schedule</p>
                <p className="font-serif text-lg font-medium text-primary-900">3:30 PM</p>
                <p className="mt-0.5 text-sm text-[#5C6478]">Soccer practice</p>
              </div>
              <div className="kw-card-dinner surface-card p-4">
                <p className="section-label mb-1">Dinner tonight</p>
                <p className="font-serif text-lg font-medium text-primary-900">Tacos</p>
                <p className="mt-0.5 text-sm text-[#5C6478]">Kids help prep</p>
              </div>
            </div>

            <div className="kw-focus-line rounded-xl border border-[#E7E2DA] bg-white/80 px-4 py-3">
              <p className="section-label mb-1">Our focus</p>
              <p className="text-sm text-primary-900">Be present at dinner — phones away.</p>
            </div>

            <p className="text-center text-[11px] text-[#5C6478]/80">
              Memories on your phone · daily plan on the wall
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
