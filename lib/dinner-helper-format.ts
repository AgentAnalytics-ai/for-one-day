import type { DinnerHelperPlan, DinnerHelperWalkStep } from '@/lib/dinner-helper-ai'

/** Strip leading list markers the model sometimes adds (fixes "1. 1. Boil water"). */
export function stripStepPrefix(step: string): string {
  return step
    .trim()
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^step\s+\d+[.:]?\s*/i, '')
    .trim()
}

export type CookWalkStep = DinnerHelperWalkStep & { id: string }

/** Normalize AI output into one linear walk-through list. */
export function buildWalkSteps(plan: DinnerHelperPlan): CookWalkStep[] {
  if (plan.steps.length > 0) {
    return plan.steps.map((s, i) => ({
      ...s,
      id: `step-${i}`,
      text: stripStepPrefix(s.text),
      time: s.time?.trim() || null,
    }))
  }

  const legacy: CookWalkStep[] = []
  let i = 0
  for (const text of plan.rightNow ?? []) {
    legacy.push({
      id: `step-${i++}`,
      time: null,
      text: stripStepPrefix(text),
      phase: 'now',
    })
  }
  for (const row of plan.timeline ?? []) {
    legacy.push({
      id: `step-${i++}`,
      time: row.label?.trim() || null,
      text: stripStepPrefix(row.step),
      phase: 'cook',
    })
  }
  return legacy
}

export function phaseLabel(phase: DinnerHelperWalkStep['phase']): string {
  switch (phase) {
    case 'now':
      return 'Right now'
    case 'prep':
      return 'Prep'
    case 'cook':
      return 'At the stove'
    case 'serve':
      return 'Serve'
    default:
      return 'Step'
  }
}
