import Link from 'next/link'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { TodayListsGlance } from '@/components/dashboard/today-lists-glance'
import { MemoryPhoneLink } from '@/components/dashboard/memory-phone-link'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { TodayListGlance } from '@/app/actions/list-actions'
import type { TonightMealGlance } from '@/app/actions/meal-actions'

type TodayGlanceHubProps = {
  householdName: string | null
  listGlance: TodayListGlance | null
  mealGlance: TonightMealGlance | null
}

/**
 * Today hub — glance (read) → This week (plan meals) → Lists (shop).
 */
export function TodayGlanceHub({ householdName, listGlance, mealGlance }: TodayGlanceHubProps) {
  const now = new Date()
  const timeLabel = now.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const dinnerTitle = mealGlance?.title?.trim() || 'Plan dinner'
  const dinnerDetail = buildDinnerDetail(mealGlance, listGlance)

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
            href="/week#today"
            label="Dinner tonight"
            title={dinnerTitle}
            detail={dinnerDetail}
            accent="dinner"
            mutedTitle={!mealGlance?.title}
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
              <span className="text-sm font-medium text-primary-900">Plan meals · see events</span>
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

function buildDinnerDetail(
  mealGlance: TonightMealGlance | null,
  listGlance: TodayListGlance | null
): string {
  const hasMeal = Boolean(mealGlance?.title?.trim())
  const shoppingCount = listGlance?.shopping.openCount ?? 0

  if (hasMeal && shoppingCount > 0) {
    return `${shoppingCount} on shopping · tap to edit the week`
  }
  if (hasMeal) {
    return 'Need groceries? Add them on Lists →'
  }
  if (mealGlance?.canEdit) {
    return 'Tap to plan tonight on This week'
  }
  return 'Pro unlocks shared meal planning for your home'
}

function GlanceCardLink({
  href,
  label,
  title,
  detail,
  accent,
  mutedTitle = false,
}: {
  href: string
  label: string
  title: string
  detail: string
  accent: 'schedule' | 'dinner'
  mutedTitle?: boolean
}) {
  return (
    <Link
      href={href}
      className={`surface-card block p-5 transition-smooth hover:border-[#D4CFC6] md:p-6 ${
        accent === 'schedule' ? 'kw-card-schedule' : 'kw-card-dinner'
      } kitchen-wall--animate`}
    >
      <p className="section-label mb-2">{label}</p>
      <p
        className={`font-serif text-xl font-medium md:text-2xl ${
          mutedTitle ? 'text-[#5C6478]' : 'text-primary-900'
        }`}
      >
        {title}
      </p>
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
