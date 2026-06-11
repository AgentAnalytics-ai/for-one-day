import Link from 'next/link'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { TodayListsGlance } from '@/components/dashboard/today-lists-glance'
import { MemoryPhoneLink } from '@/components/dashboard/memory-phone-link'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { TodayListGlance } from '@/app/actions/list-actions'

type TodayGlanceHubProps = {
  householdName: string | null
  listGlance: TodayListGlance | null
}

/**
 * Today hub — glance-first daily plan. Lists wire live at Step 6A½; meals/calendar at 6C/7.
 */
export function TodayGlanceHub({ householdName, listGlance }: TodayGlanceHubProps) {
  const now = new Date()
  const timeLabel = now.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6 md:space-y-8">
      <ScrollReveal>
        <header className="flex flex-col items-center gap-2 pt-1 text-center md:gap-3 md:pt-2">
          {householdName ? (
            <p className="text-[11px] font-medium text-[#5C6478]">
              <span className="font-semibold uppercase tracking-[0.12em] text-[#5C6478]/70">
                At home
              </span>
              {' · '}
              <span>{householdName}</span>
            </p>
          ) : null}
          <TimeGreeting />
          <p className="text-sm font-medium text-[#5C6478]">{timeLabel}</p>
        </header>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2 sm:gap-4">
          <GlanceCardLink
            href="/week"
            label="Schedule"
            title="3:30 PM · Soccer"
            detail="Full calendar on This week — merged for your home at Step 7."
            accent="schedule"
          />
          <GlanceCardLink
            href="/week"
            label="Dinner tonight"
            title="Tacos"
            detail="Meal plan lands at Step 6C. Lists below are live."
            accent="dinner"
          />
        </div>
      </ScrollReveal>

      {listGlance?.success ? (
        <ScrollReveal delay={120}>
          <div className="mx-auto w-full max-w-3xl">
            <TodayListsGlance glance={listGlance} />
          </div>
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={160}>
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/week#focus"
            className="kw-focus-line block rounded-2xl border border-[#E7E2DA] bg-white px-5 py-4 transition-smooth hover:border-[#D4CFC6]"
          >
            <p className="section-label mb-1">Our focus</p>
            <p className="font-serif text-lg font-medium text-primary-900">
              Be present at dinner — phones away.
            </p>
            <p className="mt-1 text-sm text-[#5C6478]">Tap for this season&apos;s intention →</p>
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/week"
            className="surface-card touch-tablet flex items-center justify-between px-5 py-4 transition-smooth hover:border-[#D4CFC6]"
          >
            <span>
              <span className="section-label block">This week</span>
              <span className="text-sm font-medium text-primary-900">Meals & events</span>
            </span>
            <Chevron />
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={240}>
        <MemoryPhoneLink />
      </ScrollReveal>
    </div>
  )
}

function GlanceCardLink({
  href,
  label,
  title,
  detail,
  accent,
}: {
  href: string
  label: string
  title: string
  detail: string
  accent: 'schedule' | 'dinner'
}) {
  return (
    <Link
      href={href}
      className={`surface-card block p-5 transition-smooth hover:border-[#D4CFC6] md:p-6 ${
        accent === 'schedule' ? 'kw-card-schedule' : 'kw-card-dinner'
      } kitchen-wall--animate`}
    >
      <p className="section-label mb-2">{label}</p>
      <p className="font-serif text-xl font-medium text-primary-900 md:text-2xl">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#5C6478]">{detail}</p>
    </Link>
  )
}

function Chevron() {
  return (
    <svg className="h-5 w-5 text-[#5C6478]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
