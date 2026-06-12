import Link from 'next/link'
import { WeekDinnerProgress } from '@/components/planner/week-dinner-progress'
import { WeekMealRow } from '@/components/planner/week-meal-row'
import { WeekMealSuggest } from '@/components/planner/week-meal-suggest'
import { WeekSchedulePanel } from '@/components/planner/week-schedule-panel'
import { WeekTasksBar } from '@/components/planner/week-tasks-bar'
import type { WeekMealsData } from '@/app/actions/meal-actions'
import type { WeekScheduleData } from '@/app/actions/calendar-actions'
import type { TodayListGlance } from '@/app/actions/list-actions'
import {
  formatAheadWindowLabel,
  formatUpcomingWeekRange,
  splitWeekDaysForView,
} from '@/lib/week-view-utils'

type WeekCalendarViewProps = {
  weekData: WeekMealsData
  scheduleData: WeekScheduleData
  listGlance: TodayListGlance | null
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
  listGlance,
  openDinnerHelper = false,
}: WeekCalendarViewProps) {
  const { days, canEdit } = weekData
  const { eventsByDate, connectedMembers, householdMembers } = scheduleData
  const calendarConnected = connectedMembers > 0
  const { upcomingDays, pastCount } = splitWeekDaysForView(days)
  const rangeLabel = formatUpcomingWeekRange(upcomingDays)
  const windowLabel = formatAheadWindowLabel(upcomingDays)

  if (!weekData.success) {
    return (
      <p className="text-sm text-red-700">{weekData.error ?? 'Could not load this week.'}</p>
    )
  }

  return (
    <div className="week-calendar-shell flex min-h-0 flex-col gap-3 sm:gap-4">
      <div className="week-calendar-header shrink-0 space-y-3">
        <div className="week-calendar-toolbar flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-xl font-medium tracking-tight text-primary-900 sm:text-2xl">
              {rangeLabel ?? 'This week'}
            </h2>
            <p className="mt-0.5 text-xs text-[#5C6478]">
              {windowLabel}
              {pastCount > 0 ? ' · earlier days hidden' : ''}
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

        <WeekDinnerProgress weekData={weekData} upcomingDays={upcomingDays} />
        <WeekTasksBar glance={listGlance} />
      </div>

      {!canEdit ? (
        <div className="shrink-0 rounded-2xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-[#5C6478]">
          Shared meal planning is a Pro household feature.{' '}
          <Link href="/upgrade" className="font-medium text-primary-900 hover:underline">
            Upgrade your home
          </Link>
        </div>
      ) : null}

      <div className="week-calendar-main grid min-h-0 flex-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-7">
        <div className="week-calendar-meals min-w-0 space-y-3 sm:space-y-3.5">
          {upcomingDays.map((day) => (
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

        <div className="week-calendar-sidebar hidden min-w-0 lg:block">
          <WeekSchedulePanel
            days={upcomingDays}
            eventsByDate={eventsByDate}
            connectedMembers={connectedMembers}
            householdMembers={householdMembers}
          />
        </div>
      </div>

      <div className="week-calendar-sidebar lg:hidden">
        <WeekSchedulePanel
          days={upcomingDays}
          eventsByDate={eventsByDate}
          connectedMembers={connectedMembers}
          householdMembers={householdMembers}
        />
      </div>

      <div className="week-calendar-footnotes shrink-0 space-y-2 text-center text-xs text-[#5C6478]">
        <p>Tap Plan or Change on a night · events open in Google Calendar.</p>
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
