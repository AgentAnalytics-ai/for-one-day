import Link from 'next/link'
import { WeekMealRow } from '@/components/planner/week-meal-row'
import type { WeekMealsData } from '@/app/actions/meal-actions'

type WeekCalendarViewProps = {
  weekData: WeekMealsData
}

export function WeekCalendarView({ weekData }: WeekCalendarViewProps) {
  const { days, canEdit } = weekData
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (!weekData.success) {
    return (
      <p className="text-sm text-red-700">{weekData.error ?? 'Could not load this week.'}</p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-medium text-primary-900">{monthLabel}</h2>
        <span className="text-xs font-medium text-[#5C6478]">Meals live · Calendar Step 7</span>
      </div>

      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x">
        {days.map((day) => (
          <a
            key={day.dateKey}
            href={day.isToday ? '#today' : `#meal-${day.dateKey}`}
            className={`min-w-[4.5rem] flex-shrink-0 snap-center rounded-xl px-3 py-2.5 text-center transition-colors ${
              day.isToday
                ? 'bg-primary-900 text-white'
                : 'border border-[#E7E2DA] bg-white hover:border-[#D4CFC6]'
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase ${
                day.isToday ? 'text-white/75' : 'text-[#5C6478]'
              }`}
            >
              {day.weekdayShort}
            </p>
            <p
              className={`font-serif text-lg font-medium ${
                day.isToday ? 'text-white' : 'text-primary-900'
              }`}
            >
              {day.dateNum}
            </p>
            {day.meal ? (
              <p
                className={`mt-1 truncate text-[9px] font-medium ${
                  day.isToday ? 'text-amber-200' : 'text-amber-800'
                }`}
              >
                {day.meal.title}
              </p>
            ) : null}
          </a>
        ))}
      </div>

      {!canEdit ? (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-[#5C6478]">
          Shared meal planning is a Pro household feature.{' '}
          <Link href="/upgrade" className="font-medium text-primary-900 hover:underline">
            Upgrade your home
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        {days.map((day) => (
          <WeekMealRow key={day.dateKey} day={day} canEdit={canEdit} />
        ))}
      </div>

      <p className="text-center text-xs text-[#5C6478]">
        Groceries for the week live on{' '}
        <Link href="/lists" className="font-medium text-primary-900 hover:underline">
          Lists
        </Link>
        . Google Calendar merges at Step 7.
      </p>
    </div>
  )
}
