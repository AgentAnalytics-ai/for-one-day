import Link from 'next/link'
import { WeekMealRow } from '@/components/planner/week-meal-row'
import { WeekMealSuggest } from '@/components/planner/week-meal-suggest'
import { WeekSchedulePanel } from '@/components/planner/week-schedule-panel'
import type { WeekMealsData } from '@/app/actions/meal-actions'
import type { WeekScheduleData } from '@/app/actions/calendar-actions'

type WeekCalendarViewProps = {
  weekData: WeekMealsData
  scheduleData: WeekScheduleData
  openDinnerHelper?: boolean
}

function calendarLinkLabel(connectedMembers: number, householdMembers: number): string {
  if (connectedMembers === 0) return 'Link Google'
  if (connectedMembers >= householdMembers) return 'All calendars linked'
  return `${connectedMembers} of ${householdMembers} linked`
}

export function WeekCalendarView({
  weekData,
  scheduleData,
  openDinnerHelper = false,
}: WeekCalendarViewProps) {
  const { days, canEdit } = weekData
  const { eventsByDate, connectedMembers, householdMembers } = scheduleData
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const calendarConnected = connectedMembers > 0

  if (!weekData.success) {
    return (
      <p className="text-sm text-red-700">{weekData.error ?? 'Could not load this week.'}</p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-primary-900 md:text-3xl">
            {monthLabel}
          </h2>
          <p className="mt-1 text-sm text-[#5C6478]">
            Meals on the left · Google on the right
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? <WeekMealSuggest canUse={canEdit} /> : null}
        <span
          title={
            connectedMembers > 0 && connectedMembers < householdMembers
              ? 'Each household member connects their own Google account in Settings'
              : undefined
          }
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            calendarConnected
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-[#FAF7F2] text-[#5C6478]'
          }`}
        >
          {calendarLinkLabel(connectedMembers, householdMembers)}
        </span>
        </div>
      </div>

      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x">
        {days.map((day) => {
          const eventCount = eventsByDate[day.dateKey]?.length ?? 0
          return (
            <a
              key={day.dateKey}
              href={day.isToday ? '#today' : `#meal-${day.dateKey}`}
              className={`relative min-w-[4.75rem] flex-shrink-0 snap-center rounded-2xl px-3.5 py-3 text-center transition-all ${
                day.isToday
                  ? 'bg-primary-900 text-white shadow-md shadow-primary-900/15'
                  : 'border border-[#E7E2DA] bg-white hover:border-[#D4CFC6] hover:shadow-sm'
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  day.isToday ? 'text-white/75' : 'text-[#5C6478]'
                }`}
              >
                {day.weekdayShort}
              </p>
              <p
                className={`font-serif text-xl font-medium ${
                  day.isToday ? 'text-white' : 'text-primary-900'
                }`}
              >
                {day.dateNum}
              </p>
              {day.meal ? (
                <p
                  className={`mt-1.5 truncate text-[9px] font-medium ${
                    day.isToday ? 'text-amber-200' : 'text-amber-800'
                  }`}
                >
                  {day.meal.title}
                </p>
              ) : null}
              {eventCount > 0 ? (
                <span
                  className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                    day.isToday ? 'bg-amber-400 text-primary-900' : 'bg-primary-100 text-primary-900'
                  }`}
                >
                  {eventCount}
                </span>
              ) : null}
            </a>
          )
        })}
      </div>

      {!canEdit ? (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-[#5C6478]">
          Shared meal planning is a Pro household feature.{' '}
          <Link href="/upgrade" className="font-medium text-primary-900 hover:underline">
            Upgrade your home
          </Link>
        </div>
      ) : null}

      {/* Mobile: full schedule module above meals */}
      <div className="lg:hidden">
        <WeekSchedulePanel
          days={days}
          eventsByDate={eventsByDate}
          connectedMembers={connectedMembers}
          householdMembers={householdMembers}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="space-y-3">
          {days.map((day) => (
            <WeekMealRow
              key={day.dateKey}
              day={day}
              canEdit={canEdit}
              events={eventsByDate[day.dateKey] ?? []}
              calendarConnected={calendarConnected}
              showInlineEvents={false}
              openDinnerHelper={openDinnerHelper && day.isToday}
            />
          ))}
        </div>

        <div className="hidden lg:block">
          <WeekSchedulePanel
            days={days}
            eventsByDate={eventsByDate}
            connectedMembers={connectedMembers}
            householdMembers={householdMembers}
          />
        </div>
      </div>

      <div className="space-y-2 text-center text-xs text-[#5C6478]">
        <p>
          Groceries on{' '}
          <Link href="/lists" className="font-medium text-primary-900 hover:underline">
            Lists
          </Link>
          . Tap an event to open Google Calendar.
        </p>
        {connectedMembers > 0 && connectedMembers < householdMembers ? (
          <p>
            Spouse can link their calendar in{' '}
            <Link href="/settings#profile" className="font-medium text-primary-900 hover:underline">
              Settings
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  )
}
