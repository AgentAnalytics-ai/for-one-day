import Link from 'next/link'
import { HouseholdClock } from '@/components/dashboard/household-clock'
import { HouseholdTimezonePrompt } from '@/components/dashboard/household-timezone-prompt'
import { TodayListsGlance } from '@/components/dashboard/today-lists-glance'
import { MemoryPhoneLink } from '@/components/dashboard/memory-phone-link'
import { DinnerTonightGlance } from '@/components/dashboard/dinner-tonight-glance'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { TodayScheduleGlance } from '@/app/actions/calendar-actions'
import type { TodayListGlance } from '@/app/actions/list-actions'
import type { TonightMealGlance } from '@/app/actions/meal-actions'
import { shouldShowScheduleOnToday } from '@/lib/today-glance-utils'

type TodayGlanceHubProps = {
  householdName: string | null
  householdTimezone: string
  needsTimezoneConfirm: boolean
  listGlance: TodayListGlance | null
  mealGlance: TonightMealGlance | null
  scheduleGlance: TodayScheduleGlance | null
}

/**
 * Today hub — one screen, no empty noise. Glance → tap → This week / Lists.
 */
export function TodayGlanceHub({
  householdName,
  householdTimezone,
  needsTimezoneConfirm,
  listGlance,
  mealGlance,
  scheduleGlance,
}: TodayGlanceHubProps) {
  const showSchedule = shouldShowScheduleOnToday(scheduleGlance)
  const scheduleCopy = buildScheduleCopy(scheduleGlance)
  const dinnerTitle = mealGlance?.title?.trim() || 'What’s for dinner?'
  const dinnerDetail = buildDinnerDetail(mealGlance, listGlance)

  return (
    <div className="today-glance mx-auto w-full max-w-3xl space-y-4 md:space-y-5">
      <ScrollReveal>
        <header className="flex flex-col items-center gap-1 pt-0 text-center md:gap-1.5">
          {householdName ? (
            <p className="text-[11px] font-medium text-[#5C6478]">
              <span className="font-semibold uppercase tracking-[0.12em] text-[#5C6478]/70">
                At home
              </span>
              {' · '}
              <span>{householdName}</span>
            </p>
          ) : null}
          <HouseholdClock timeZone={householdTimezone} />
        </header>
      </ScrollReveal>

      {needsTimezoneConfirm ? (
        <ScrollReveal delay={40}>
          <HouseholdTimezonePrompt show={needsTimezoneConfirm} />
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={60}>
        <div
          className={`grid w-full gap-3 sm:gap-4 ${
            showSchedule ? 'sm:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {showSchedule ? (
            <GlanceCardLink
              href={scheduleGlance?.needsConnect ? '/settings#profile' : '/week#today'}
              label="Schedule"
              title={scheduleCopy.title}
              detail={scheduleCopy.detail}
              accent="schedule"
              mutedTitle={scheduleCopy.muted}
            />
          ) : null}
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

      {listGlance?.success &&
      (listGlance.shopping.openCount > 0 || listGlance.todo.openCount > 0) ? (
        <ScrollReveal delay={90}>
          <TodayListsGlance glance={listGlance} />
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={120}>
        <Link
          href="/week#focus"
          className="kw-focus-line block rounded-2xl border border-[#E7E2DA] bg-white/80 px-4 py-3 transition-smooth hover:border-[#D4CFC6]"
        >
          <p className="font-serif text-base font-medium text-primary-900">
            Be present at dinner — phones away.
          </p>
        </Link>
      </ScrollReveal>

      <MemoryPhoneLink />
    </div>
  )
}

function buildScheduleCopy(scheduleGlance: TodayScheduleGlance | null): {
  title: string
  detail: string
  muted: boolean
} {
  if (!scheduleGlance?.success) {
    return { title: 'Schedule', detail: 'Could not load', muted: true }
  }

  if (scheduleGlance.needsConnect) {
    return {
      title: 'Connect calendar',
      detail: 'Link Google in Settings → Profile',
      muted: true,
    }
  }

  if (scheduleGlance.nextEvent) {
    const e = scheduleGlance.nextEvent
    return {
      title: `${e.timeLabel} · ${e.title}`,
      detail: `${scheduleGlance.todayCount} today · ${e.memberName}`,
      muted: false,
    }
  }

  if (scheduleGlance.todayCount > 0) {
    return {
      title: `${scheduleGlance.todayCount} events today`,
      detail: 'Tap for your home schedule',
      muted: false,
    }
  }

  return { title: '', detail: '', muted: true }
}

function buildDinnerDetail(
  mealGlance: TonightMealGlance | null,
  listGlance: TodayListGlance | null
): string {
  const hasMeal = Boolean(mealGlance?.title?.trim())
  const shoppingCount = listGlance?.shopping.openCount ?? 0

  if (hasMeal && shoppingCount > 0) {
    return `${shoppingCount} on Shopping · tap for walk-through`
  }
  if (hasMeal) {
    return 'Tap for a walk-through'
  }
  if (mealGlance?.canEdit) {
    return 'Tap for a walk-through'
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
