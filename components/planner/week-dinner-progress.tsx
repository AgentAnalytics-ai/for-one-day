import type { WeekMealsData } from '@/app/actions/meal-actions'
import { cn } from '@/lib/utils'

type WeekDinnerProgressProps = {
  weekData: WeekMealsData
  upcomingDays: WeekMealsData['days']
}

/**
 * Planning meter matches what’s on screen:
 * mid-week → nights ahead only; start of week → full week.
 */
export function WeekDinnerProgress({ weekData, upcomingDays }: WeekDinnerProgressProps) {
  if (!weekData.success || weekData.days.length === 0) return null

  const allDays = weekData.days
  const totalAll = allDays.length
  const plannedAll = allDays.filter((d) => d.meal?.title?.trim()).length

  const totalAhead = upcomingDays.length
  const plannedAhead = upcomingDays.filter((d) => d.meal?.title?.trim()).length
  const pastHidden = totalAhead < totalAll

  const planned = pastHidden ? plannedAhead : plannedAll
  const total = pastHidden ? totalAhead : totalAll
  const fillPercent = total > 0 ? Math.min(100, (planned / total) * 100) : 0
  const complete = planned >= total && total > 0

  const label = pastHidden
    ? complete
      ? 'Nights ahead are planned'
      : `${planned} of ${total} nights ahead`
    : complete
      ? 'Week is planned'
      : `${planned} of ${total} dinners this week`

  const ariaLabel = pastHidden
    ? `${planned} of ${total} upcoming dinners planned`
    : `${planned} of ${total} dinners planned this week`

  return (
    <div
      className={cn(
        'week-dinner-progress flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-2.5 sm:gap-x-4 sm:px-4',
        complete
          ? 'border-amber-200/80 bg-amber-50/50'
          : 'border-[#E7E2DA]/90 bg-[#FAF7F2]/40'
      )}
      aria-label={ariaLabel}
    >
      <p className="text-sm font-medium text-primary-900">{label}</p>

      <div className="h-1.5 min-w-[5rem] flex-1 overflow-hidden rounded-full bg-[#E7E2DA]/80 sm:max-w-[10rem]">
        <div
          className={cn(
            'readiness-bar-fill h-full rounded-full transition-all duration-700 ease-out',
            complete ? 'bg-amber-500' : 'bg-primary-800'
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {!complete && total > 0 ? (
        <span className="text-[11px] font-semibold tabular-nums text-[#5C6478]">
          {Math.round(fillPercent)}%
        </span>
      ) : null}
    </div>
  )
}
