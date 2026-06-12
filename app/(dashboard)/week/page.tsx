import Link from 'next/link'
import { getCachedWeekScheduleData } from '@/app/actions/calendar-actions'
import { getCachedWeekMealsData } from '@/app/actions/meal-actions'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { WeekCalendarView } from '@/components/planner/week-calendar-view'
import { FocusView } from '@/components/planner/focus-view'

export const dynamic = 'force-dynamic'

type WeekPageProps = {
  searchParams: Promise<{ helper?: string }>
}

export default async function WeekPage({ searchParams }: WeekPageProps) {
  const sp = await searchParams
  const [weekData, scheduleData] = await Promise.all([
    getCachedWeekMealsData(),
    getCachedWeekScheduleData(),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">This week</span>}
          title="Meals & schedule"
          subtitle="Plan meals here. Events sync from Google Calendar — add or edit future events in Google, not in this app."
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <WeekCalendarView
          weekData={weekData}
          scheduleData={scheduleData}
          openDinnerHelper={sp.helper === '1'}
        />
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <div id="focus" className="border-t border-[#E7E2DA] pt-8 scroll-mt-24">
          <FocusView />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <p className="text-center text-sm text-[#5C6478]">
          <Link href="/dashboard" className="font-medium text-primary-900 hover:underline">
            ← Back to Today
          </Link>
        </p>
      </ScrollReveal>
    </div>
  )
}
