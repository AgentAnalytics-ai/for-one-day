import Link from 'next/link'
import { getCachedWeekMealsData } from '@/app/actions/meal-actions'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { WeekCalendarView } from '@/components/planner/week-calendar-view'
import { FocusView } from '@/components/planner/focus-view'

export default async function WeekPage() {
  const weekData = await getCachedWeekMealsData()

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">This week</span>}
          title="Calendar & meals"
          subtitle="Plan dinners here — groceries stay on Lists. Events merge at Step 7."
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <WeekCalendarView weekData={weekData} />
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
