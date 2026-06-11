import Link from 'next/link'
import { getCachedWeekScheduleData } from '@/app/actions/calendar-actions'
import { getCachedWeekMealsData } from '@/app/actions/meal-actions'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { WeekCalendarView } from '@/components/planner/week-calendar-view'
import { FocusView } from '@/components/planner/focus-view'

export const dynamic = 'force-dynamic'

export default async function WeekPage() {
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
          subtitle="One place for the week — dinners you choose, events from Google."
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <WeekCalendarView weekData={weekData} scheduleData={scheduleData} />
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
