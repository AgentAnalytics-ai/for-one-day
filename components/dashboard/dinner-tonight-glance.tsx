'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChefHat } from 'lucide-react'
import { DinnerHelper } from '@/components/planner/dinner-helper'

type DinnerTonightGlanceProps = {
  planDate: string
  initialMealTitle?: string | null
  title: string
  detail: string
  canEdit: boolean
  mutedTitle?: boolean
}

/**
 * Single dinner surface on Today — glance + walk-through entry (no duplicate card).
 */
export function DinnerTonightGlance({
  planDate,
  initialMealTitle,
  title,
  detail,
  canEdit,
  mutedTitle = false,
}: DinnerTonightGlanceProps) {
  const [open, setOpen] = useState(false)

  if (!canEdit) {
    return (
      <Link
        href="/week#today"
        className="today-glance-card kw-dinner-glance-card kitchen-wall--animate surface-card block p-4 sm:p-5 lg:p-6"
      >
        <GlanceContent title={title} detail={detail} mutedTitle={mutedTitle} />
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`today-glance-card kw-dinner-glance-card kitchen-wall--animate touch-tablet group flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5 lg:p-6 ${
          mutedTitle ? '' : 'border-[#FDE68A]/90 bg-gradient-to-br from-amber-50/95 to-white'
        }`}
      >
        <span className="min-w-0 flex-1">
          <GlanceContent title={title} detail={detail} mutedTitle={mutedTitle} />
        </span>
        <span className="flex shrink-0 flex-col items-center gap-1 text-amber-900/70">
          <ChefHat
            className="h-7 w-7 transition-transform duration-200 group-hover:scale-105 sm:h-8 sm:w-8"
            strokeWidth={1.75}
          />
          <ChevronRight
            className="h-5 w-5 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </button>

      <DinnerHelper
        planDate={planDate}
        initialMealTitle={initialMealTitle}
        canUse={canEdit}
        open={open}
        onOpenChange={setOpen}
        hideTrigger
      />
    </>
  )
}

function GlanceContent({
  title,
  detail,
  mutedTitle,
}: {
  title: string
  detail: string
  mutedTitle: boolean
}) {
  return (
    <>
      <p className="section-label mb-2">Dinner tonight</p>
      <p
        className={`glance-card-title font-serif font-medium ${
          mutedTitle ? 'text-[#5C6478]' : 'text-primary-900'
        }`}
      >
        {title}
      </p>
      <p className="glance-card-detail mt-1.5 leading-relaxed text-[#5C6478]">{detail}</p>
    </>
  )
}
