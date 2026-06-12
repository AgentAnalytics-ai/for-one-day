import type { TodayScheduleGlance } from '@/app/actions/calendar-actions'
import type { TodayListGlance } from '@/app/actions/list-actions'
import type { TonightMealGlance } from '@/app/actions/meal-actions'

export type HomeReadinessPillarId = 'dinner' | 'schedule' | 'lists'

export type HomeReadinessPillar = {
  id: HomeReadinessPillarId
  /** Rail label — preparation framing, not “task done”. */
  label: string
  done: boolean
  /** Shown when set — e.g. “Planned”, not a eaten-dinner checkmark. */
  doneCaption: string
  hint?: string
  /** Lists are the only pillar that means literal completion. */
  isCompletionStyle: boolean
}

export type HomeReadiness = {
  score: number
  total: number
  message: string
  pillars: HomeReadinessPillar[]
}

/**
 * “Today mapped” meter — what’s *planned* for the home, not what’s eaten or finished.
 * Psychology: preparation clarity (wall), not gamified task completion.
 */
export function computeHomeReadiness(
  mealGlance: TonightMealGlance | null,
  scheduleGlance: TodayScheduleGlance | null,
  listGlance: TodayListGlance | null
): HomeReadiness {
  const dinnerPlanned = Boolean(mealGlance?.title?.trim())
  const dayMapped = Boolean(
    scheduleGlance?.success &&
      !scheduleGlance.needsConnect &&
      (scheduleGlance.nextEvent ||
        scheduleGlance.todayCount > 0 ||
        scheduleGlance.connectedMembers > 0)
  )
  const todosClear = !listGlance?.success || listGlance.todo.openCount === 0

  const pillars: HomeReadinessPillar[] = [
    {
      id: 'dinner',
      label: 'Dinner planned',
      done: dinnerPlanned,
      doneCaption: 'Planned',
      hint: dinnerPlanned ? undefined : 'Pick tonight',
      isCompletionStyle: false,
    },
    {
      id: 'schedule',
      label: 'Day mapped',
      done: dayMapped,
      doneCaption: 'Mapped',
      hint: scheduleGlance?.needsConnect
        ? 'Link calendar'
        : dayMapped
          ? undefined
          : 'Check week',
      isCompletionStyle: false,
    },
    {
      id: 'lists',
      label: 'To-dos caught up',
      done: todosClear,
      doneCaption: 'Caught up',
      hint: todosClear ? undefined : `${listGlance?.todo.openCount ?? 0} open`,
      isCompletionStyle: true,
    },
  ]

  const score = pillars.filter((p) => p.done).length
  const message = readinessMessage(score, pillars)

  return { score, total: pillars.length, message, pillars }
}

function readinessMessage(score: number, pillars: HomeReadinessPillar[]): string {
  if (score >= 3) return 'Today is mapped.'
  if (score === 2) {
    const next = pillars.find((p) => !p.done)
    if (next?.id === 'dinner') return 'Plan tonight’s dinner.'
    if (next?.id === 'schedule') return 'Map the day — link or check calendar.'
    if (next?.id === 'lists') return 'Catch up on today’s to-dos when you can.'
  }
  if (score === 1) return 'A little more planning for today.'
  return 'Map today together.'
}
