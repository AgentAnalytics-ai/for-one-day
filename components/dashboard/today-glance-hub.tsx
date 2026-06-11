import Link from 'next/link'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { TodayListsGlance } from '@/components/dashboard/today-lists-glance'
import { MemoryPhoneLink } from '@/components/dashboard/memory-phone-link'
import { DinnerTonightGlance } from '@/components/dashboard/dinner-tonight-glance'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { TodayScheduleGlance } from '@/app/actions/calendar-actions'
import type { TodayListGlance } from '@/app/actions/list-actions'
import type { TonightMealGlance } from '@/app/actions/meal-actions'

type TodayGlanceHubProps = {
  householdName: string | null
  listGlance: TodayListGlance | null
  mealGlance: TonightMealGlance | null
  scheduleGlance: TodayScheduleGlance | null
}

/**
 * Today hub — glance (read) → This week (plan meals) → Lists (shop).
 */
export function TodayGlanceHub({
  householdName,
  listGlance,
  mealGlance,
  scheduleGlance,
}: TodayGlanceHubProps) {
  const now = new Date()
  const timeLabel = now.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const dinnerTitle = mealGlance?.title?.trim() || 'What’s for dinner?'
  const dinnerDetail = buildDinnerDetail(mealGlance, listGlance)
  const scheduleCopy = buildScheduleCopy(scheduleGlance)

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
            href={scheduleGlance?.needsConnect ? '/settings#profile' : '/week#today'}
            label="Schedule"
            title={scheduleCopy.title}
            detail={scheduleCopy.detail}
            accent="schedule"
            mutedTitle={scheduleCopy.muted}
          />
          <DinnerTonightGlance
            planDate={mealGlance?.planDate ?? ''}
            initialMealTitle={mealGlance?.title}
            title={dinnerTitle}
            detail={dinnerDetail}
            canEdit={Boolean(mealGlance?.canEdit)}
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

function buildScheduleCopy(scheduleGlance: TodayScheduleGlance | null): {
  title: string
  detail: string
  muted: boolean
} {
  if (!scheduleGlance?.success) {
    return { title: 'Schedule', detail: 'Could not load calendar', muted: true }
  }

  if (scheduleGlance.needsConnect) {
    return {
      title: 'Connect calendar',
      detail: 'Link Google in Settings → Profile. Sara connects hers too.',
      muted: true,
    }
  }

  if (scheduleGlance.nextEvent) {
    const e = scheduleGlance.nextEvent
    return {
      title: `${e.timeLabel} · ${e.title}`,
      detail: `${scheduleGlance.todayCount} today · ${e.memberName} · tap for week`,
      muted: false,
    }
  }

  if (scheduleGlance.todayCount > 0) {
    return {
      title: `${scheduleGlance.todayCount} events today`,
      detail: 'Open This week for your home schedule',
      muted: false,
    }
  }

  return {
    title: 'Nothing scheduled',
    detail: 'Free evening — plan dinner on This week',
    muted: true,
  }
}

function buildDinnerDetail(
  mealGlance: TonightMealGlance | null,
  listGlance: TodayListGlance | null
): string {
  const hasMeal = Boolean(mealGlance?.title?.trim())
  const shoppingCount = listGlance?.shopping.openCount ?? 0

  if (hasMeal && shoppingCount > 0) {
    return `${shoppingCount} on Shopping · steps below if you want them`
  }
  if (hasMeal) {
    return 'Tap for a walk-through — steps and groceries lined up'
  }
  if (mealGlance?.canEdit) {
    return 'Tap for a walk-through — or plan on This week'
  }
  return 'Pro unlocks dinner walk-throughs for your home'
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
