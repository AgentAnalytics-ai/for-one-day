import Link from 'next/link'
import { TodayHeroClock } from '@/components/dashboard/today-hero-clock'
import { HouseholdTimezonePrompt } from '@/components/dashboard/household-timezone-prompt'
import { WeekTasksBar } from '@/components/planner/week-tasks-bar'
import { WallPhotoStrip } from '@/components/dashboard/wall-photo-strip'
import { MemoryPhoneLink } from '@/components/dashboard/memory-phone-link'
import { DinnerTonightGlance } from '@/components/dashboard/dinner-tonight-glance'
import { HomeReadinessStrip } from '@/components/dashboard/home-readiness-strip'
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
 * Today hub — hero aligned with nav logo; readiness rail beside cards only.
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
  const showTasksBar = Boolean(listGlance?.success)

  return (
    <div className="today-glance-shell">
      <div className="today-glance-frame">
        {needsTimezoneConfirm ? (
          <div className="today-glance-tz">
            <HouseholdTimezonePrompt show={needsTimezoneConfirm} compact />
          </div>
        ) : null}

        <header className="today-glance-hero text-center">
          {householdName ? (
            <p className="today-glance-eyebrow text-[11px] font-medium text-[#5C6478] sm:text-xs">
              <span className="font-semibold uppercase tracking-[0.12em] text-[#5C6478]/70">
                At home
              </span>
              {' · '}
              <span>{householdName}</span>
            </p>
          ) : null}
          <TodayHeroClock timeZone={householdTimezone} />
        </header>

        <WallPhotoStrip />

        <div className="today-glance-body">
          <aside className="today-glance-rail self-start" aria-label="Today preparation">
            <HomeReadinessStrip
              mealGlance={mealGlance}
              scheduleGlance={scheduleGlance}
              listGlance={listGlance}
            />
          </aside>

          <div className="today-glance-main">
            <div
              className={`today-glance-cards grid w-full gap-3 ${
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

            {showTasksBar ? (
              <div className="today-glance-tasks min-h-0">
                <WeekTasksBar glance={listGlance} />
              </div>
            ) : null}

            <Link
              href="/week#focus"
              className="today-glance-focus kw-focus-line block rounded-2xl border border-[#E7E2DA] bg-white/80 px-4 py-2.5 transition-smooth hover:border-[#D4CFC6] sm:py-3"
            >
              <p className="glance-card-detail font-serif text-base font-medium text-primary-900 sm:text-lg">
                Be present at dinner — phones away.
              </p>
            </Link>
          </div>
        </div>
      </div>

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
    return `${shoppingCount} on Groceries`
  }
  if (hasMeal) {
    return 'Tap for walk-through'
  }
  if (mealGlance?.canEdit) {
    return 'Pick on This week or tap to choose'
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
      className={`today-glance-card surface-card block p-4 transition-smooth hover:border-[#D4CFC6] sm:p-5 lg:p-6 ${
        accent === 'schedule' ? 'kw-card-schedule' : 'kw-card-dinner'
      } kitchen-wall--animate`}
    >
      <p className="section-label mb-2">{label}</p>
      <p
        className={`glance-card-title font-serif font-medium ${
          mutedTitle ? 'text-[#5C6478]' : 'text-primary-900'
        }`}
      >
        {title}
      </p>
      <p className="glance-card-detail mt-1.5 leading-relaxed text-[#5C6478]">{detail}</p>
    </Link>
  )
}
