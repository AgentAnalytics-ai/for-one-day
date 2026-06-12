import Link from 'next/link'
import { getCachedWeekScheduleData } from '@/app/actions/calendar-actions'
import { getCachedTodayListGlance } from '@/app/actions/list-actions'
import { getCachedWeekMealsData } from '@/app/actions/meal-actions'
import { PageHeader } from '@/components/ui/page-header'
import { WeekCalendarView } from '@/components/planner/week-calendar-view'
import { FocusView } from '@/components/planner/focus-view'

export const dynamic = 'force-dynamic'

type WeekPageProps = {
  searchParams: Promise<{ helper?: string }>
}

export default async function WeekPage({ searchParams }: WeekPageProps) {
  const sp = await searchParams
  const [weekData, scheduleData, listGlance] = await Promise.all([
    getCachedWeekMealsData(),
    getCachedWeekScheduleData(),
    getCachedTodayListGlance(),
  ])

  return (
    <div className="week-page-shell mx-auto flex h-full max-w-6xl flex-col">
      <header className="week-page-hero shrink-0 pb-4 sm:pb-5">
        <PageHeader
          eyebrow={<span className="text-primary-900">This week</span>}
          title="Meals & schedule"
          subtitle="Plan meals here. Events sync from Google Calendar — add or edit future events in Google, not in this app."
        />
      </header>

      <div className="week-page-body min-h-0 flex-1">
        <WeekCalendarView
          weekData={weekData}
          scheduleData={scheduleData}
          listGlance={listGlance}
          openDinnerHelper={sp.helper === '1'}
        />
      </div>

      <div id="focus" className="week-page-focus shrink-0 border-t border-[#E7E2DA] pt-6 scroll-mt-24">
        <FocusView />
      </div>

      <p className="week-page-back shrink-0 pt-4 text-center text-sm text-[#5C6478]">
        <Link href="/dashboard" className="font-medium text-primary-900 hover:underline">
          ← Back to Today
        </Link>
      </p>
    </div>
  )
}
