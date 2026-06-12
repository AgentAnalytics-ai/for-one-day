import Link from 'next/link'
import { Check } from 'lucide-react'
import type { TodayScheduleGlance } from '@/app/actions/calendar-actions'
import type { TodayListGlance } from '@/app/actions/list-actions'
import type { TonightMealGlance } from '@/app/actions/meal-actions'
import { computeHomeReadiness, type HomeReadinessPillarId } from '@/lib/home-readiness'
import { cn } from '@/lib/utils'

const PILLAR_HREF: Record<HomeReadinessPillarId, string> = {
  dinner: '/week#today',
  schedule: '/week#today',
  lists: '/lists',
}

type HomeReadinessProps = {
  mealGlance: TonightMealGlance | null
  scheduleGlance: TodayScheduleGlance | null
  listGlance: TodayListGlance | null
}

/**
 * Side rail — “today mapped” preparation, not eaten-dinner checkmarks.
 */
export function HomeReadinessStrip({
  mealGlance,
  scheduleGlance,
  listGlance,
}: HomeReadinessProps) {
  const readiness = computeHomeReadiness(mealGlance, scheduleGlance, listGlance)
  const fillPercent = (readiness.score / readiness.total) * 100
  const allMapped = readiness.score === readiness.total

  return (
    <aside
      className={cn(
        'readiness-rail surface-card flex h-auto flex-col self-start border px-2 py-2.5 transition-colors sm:px-2.5 sm:py-3',
        allMapped
          ? 'border-emerald-200/90 bg-gradient-to-b from-emerald-50/95 to-white'
          : 'border-[#E7E2DA] bg-white/90'
      )}
      aria-label={`Today preparation: ${readiness.score} of ${readiness.total} mapped`}
    >
      <div className="mb-1.5 text-center sm:mb-2">
        <p
          className={cn(
            'text-lg font-semibold tabular-nums leading-none',
            allMapped ? 'text-emerald-800' : 'text-primary-900'
          )}
        >
          {readiness.score}
          <span className="text-sm font-medium text-[#5C6478]">/{readiness.total}</span>
        </p>
        <p className="readiness-rail-message mt-1 text-[10px] font-medium leading-tight text-[#5C6478]">
          {allMapped ? 'All mapped' : 'Mapped'}
        </p>
      </div>

      <div
        className="readiness-rail-track relative mx-auto mb-2 h-10 w-1.5 overflow-hidden rounded-full bg-[#F0EBE3] sm:mb-2.5 sm:h-11"
        aria-hidden
      >
        <div
          className={cn(
            'readiness-bar-fill absolute bottom-0 left-0 w-full rounded-full transition-all duration-700 ease-out',
            allMapped ? 'bg-emerald-500' : 'bg-primary-800'
          )}
          style={{ height: `${fillPercent}%` }}
        />
      </div>

      <nav className="flex flex-col gap-1 sm:gap-1.5" aria-label="Today preparation">
        {readiness.pillars.map((pillar) => (
          <Link
            key={pillar.id}
            href={PILLAR_HREF[pillar.id]}
            title={
              pillar.done
                ? `${pillar.label} — ${pillar.doneCaption}`
                : pillar.hint ?? pillar.label
            }
            className={cn(
              'readiness-pillar touch-tablet flex flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center transition-all sm:gap-1 sm:py-2',
              pillar.done
                ? 'bg-emerald-50/90 text-emerald-900'
                : 'bg-[#FAF7F2] text-[#5C6478] hover:bg-[#F3EDE4]/70'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border transition-all sm:h-7 sm:w-7',
                pillar.done
                  ? pillar.isCompletionStyle
                    ? 'border-emerald-300 bg-emerald-500 text-white readiness-pillar-done'
                    : 'border-emerald-300 bg-emerald-100 readiness-pillar-done'
                  : 'border-[#D4CFC6] bg-white'
              )}
            >
              {pillar.done && pillar.isCompletionStyle ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
              ) : pillar.done ? (
                <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
              ) : null}
            </span>
            <span className="readiness-rail-label text-[8px] font-bold uppercase leading-tight tracking-wide sm:text-[9px]">
              {pillar.label}
            </span>
            {pillar.done ? (
              <span className="readiness-rail-caption text-[8px] font-semibold text-emerald-800 sm:text-[9px]">
                {pillar.doneCaption}
              </span>
            ) : pillar.hint ? (
              <span className="readiness-rail-hint text-[8px] font-semibold leading-tight opacity-90 sm:text-[9px]">
                {pillar.hint}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
