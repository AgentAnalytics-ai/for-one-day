import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { WeekCalendarView } from '@/components/planner/week-calendar-view'
import { FocusView } from '@/components/planner/focus-view'

export default function WeekPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">This week</span>}
          title="Calendar & meals"
          subtitle="Your home at a glance — events, dinner, and our focus."
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <WeekCalendarView />
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <div className="border-t border-[#E7E2DA] pt-8">
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
