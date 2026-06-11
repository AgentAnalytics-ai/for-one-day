import Link from 'next/link'
import { CalendarDays, ExternalLink } from 'lucide-react'
import type { HouseholdScheduleEvent } from '@/lib/calendar-merge'
import type { HouseholdWeekDay } from '@/lib/household-dates'
import { ScheduleEventRow } from '@/components/planner/schedule-event-row'

type WeekSchedulePanelProps = {
  days: HouseholdWeekDay[]
  eventsByDate: Record<string, HouseholdScheduleEvent[]>
  connectedMembers: number
  householdMembers: number
}

export function WeekSchedulePanel({
  days,
  eventsByDate,
  connectedMembers,
  householdMembers,
}: WeekSchedulePanelProps) {
  const connected = connectedMembers > 0
  const totalEvents = days.reduce(
    (sum, day) => sum + (eventsByDate[day.dateKey]?.length ?? 0),
    0
  )

  return (
    <aside
      className="surface-card flex max-h-[min(32rem,calc(100dvh-10rem))] flex-col overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)]"
      aria-labelledby="week-schedule-heading"
    >
      <div className="border-b border-[#E7E2DA]/80 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100/80 text-primary-900">
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h2 id="week-schedule-heading" className="font-serif text-lg font-medium text-primary-900">
                Household schedule
              </h2>
              <p className="mt-0.5 text-xs text-[#5C6478]">
                {connected
                  ? `${totalEvents} event${totalEvents === 1 ? '' : 's'} · ${connectedMembers}/${householdMembers} linked`
                  : 'Merge Google calendars for the home'}
              </p>
            </div>
          </div>
          {connected ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              Live
            </span>
          ) : null}
        </div>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {!connected ? (
          <div className="rounded-xl border border-dashed border-[#E7E2DA] bg-[#FAF7F2]/60 px-4 py-5 text-center">
            <p className="text-sm text-[#5C6478]">
              Connect Google in Settings — each person links their own calendar.
            </p>
            <Link href="/settings#profile" className="btn-primary mt-4 inline-flex text-sm">
              Connect calendar
            </Link>
          </div>
        ) : totalEvents === 0 ? (
          <div className="rounded-xl bg-[#FAF7F2]/80 px-4 py-6 text-center">
            <p className="font-serif text-base text-primary-900">A quiet week</p>
            <p className="mt-1 text-sm text-[#5C6478]">
              Events from Primary and Birthdays appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {days.map((day) => {
              const events = eventsByDate[day.dateKey] ?? []
              if (events.length === 0) return null

              return (
                <section key={day.dateKey} aria-label={`${day.weekday} events`}>
                  <div
                    className={`mb-2 flex items-baseline gap-2 px-1 ${
                      day.isToday ? 'text-primary-900' : 'text-[#5C6478]'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                      {day.isToday ? 'Today' : day.weekdayShort}
                    </span>
                    <span className="font-serif text-sm font-medium">
                      {day.weekdayShort}, {day.dateNum}
                    </span>
                    <span className="ml-auto text-[10px] font-medium text-[#5C6478]/70">
                      {events.length}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {events.map((event) => (
                      <li key={event.id}>
                        <ScheduleEventRow event={event} variant="agenda" />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#E7E2DA]/80 px-4 py-3 sm:px-5">
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C6478] hover:text-primary-900"
        >
          Open Google Calendar
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  )
}
