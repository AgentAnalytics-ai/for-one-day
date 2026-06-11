/** Strip leading list markers the model sometimes adds (fixes "1. 1. Boil water"). */
export function stripStepPrefix(step: string): string {
  return step
    .trim()
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^step\s+\d+[.:]?\s*/i, '')
    .trim()
}

/** Hide stove section when the timeline already walks through cooking. */
export function shouldShowCookSteps(
  timeline: Array<{ step: string }>,
  cookSteps: string[]
): boolean {
  if (cookSteps.length === 0) return false
  if (timeline.length < 3) return true

  const timelineText = timeline.map((t) => t.step.toLowerCase()).join(' ')
  const overlap = cookSteps.filter((step) => {
    const words = stripStepPrefix(step).toLowerCase().split(/\s+/).slice(0, 4).join(' ')
    return words.length > 8 && timelineText.includes(words.slice(0, 20))
  })

  return overlap.length < cookSteps.length * 0.6
}
