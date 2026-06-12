/** Server-side grounding for dinner walk-through — no invented prep steps. */

export type DinnerGroundingInput = {
  notes: string
  householdNames: string[]
  shoppingOnList: string[]
}

export type DinnerWalkContext = DinnerGroundingInput & {
  mealHint: string
  servingTime: string
  nowLabel: string
  timezone: string
  cookName: string | null
  minutesUntilServe: number | null
}

export function firstName(fullName: string | null | undefined): string | null {
  const n = fullName?.trim().split(/\s+/)[0]
  return n || null
}

/** Minutes from now until serve time (e.g. "6:00 PM") in the household timezone. */
export function minutesUntilServe(
  now: Date,
  servingTime: string,
  timeZone: string
): number | null {
  const m = servingTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return null

  let hours = parseInt(m[1], 10)
  const minutes = parseInt(m[2], 10)
  const period = m[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10)

  const nowMins = pick('hour') * 60 + pick('minute')
  const serveMins = hours * 60 + minutes
  let diff = serveMins - nowMins
  if (diff < 0) diff += 24 * 60
  return diff
}

export function notesAllowDelegation(notes: string, householdNames: string[]): boolean {
  const trimmed = notes.trim()
  if (!trimmed) return false
  if (/\b(text|ask|tell|message)\b/i.test(trimmed)) return true
  const lower = trimmed.toLowerCase()
  return householdNames.some((n) => lower.includes(n.toLowerCase()))
}

export function notesAllowFreezerLanguage(notes: string): boolean {
  return /\b(freezer|thaw|defrost|frozen)\b/i.test(notes)
}

export function notesAllowPantryLanguage(notes: string): boolean {
  return /\bpantry\b/i.test(notes)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Drop steps the model invented (freezer, pantry, texting) when notes did not allow them. */
export function isStepGrounded(
  text: string,
  input: Pick<DinnerGroundingInput, 'notes' | 'householdNames'>
): boolean {
  const step = text.trim()
  if (!step) return false

  if (/\byour\s+(wife|husband|spouse)\b/i.test(step)) return false

  if (
    /\b(freezer|thaw|defrost|pull\s+.+\s+from|pull\s+out)\b/i.test(step) &&
    !notesAllowFreezerLanguage(input.notes)
  ) {
    return false
  }

  if (/\b(pantry|grab\s+from)\b/i.test(step) && !notesAllowPantryLanguage(input.notes)) {
    return false
  }

  if (/\bgather\s+ingredients?\b/i.test(step) && !/\bgather\b/i.test(input.notes)) {
    return false
  }

  const mentionsHousehold = input.householdNames.some((n) =>
    new RegExp(`\\b${escapeRegExp(n)}\\b`, 'i').test(step)
  )
  const looksLikeDelegation = /\b(text|ask|tell|message)\s+/i.test(step)
  if (
    (mentionsHousehold || looksLikeDelegation) &&
    !notesAllowDelegation(input.notes, input.householdNames)
  ) {
    return false
  }

  return true
}

export function filterShoppingSuggestions(
  suggestions: string[],
  onList: string[]
): string[] {
  const existing = onList.map((s) => s.trim().toLowerCase()).filter(Boolean)
  return suggestions.filter((raw) => {
    const t = raw.trim().toLowerCase()
    if (!t) return false
    return !existing.some((e) => t === e || t.includes(e) || e.includes(t))
  })
}

export function buildGroundingFactsBlock(ctx: DinnerWalkContext): string {
  const notes = ctx.notes.trim()
  const delegation = notesAllowDelegation(notes, ctx.householdNames)
  const freezer = notesAllowFreezerLanguage(notes)
  const pantry = notesAllowPantryLanguage(notes)

  const lines: string[] = [
    `Cook tonight: ${ctx.cookName ?? 'the person reading the steps'}`,
  ]

  if (ctx.householdNames.length > 0) {
    lines.push(`Household names (spell exactly): ${ctx.householdNames.join(', ')}`)
  } else {
    lines.push('No other household members on file.')
  }

  if (ctx.minutesUntilServe != null) {
    lines.push(`Minutes until plates: ${ctx.minutesUntilServe}`)
    lines.push(
      ctx.minutesUntilServe < 45
        ? 'Rushed — use 6–8 steps max.'
        : 'Use 8–10 steps.'
    )
  }

  lines.push(
    delegation
      ? 'Delegation OK — notes mention someone or ask to text/ask.'
      : 'NO steps that text, ask, or delegate to anyone.'
  )
  lines.push(
    freezer
      ? 'Freezer/thaw steps OK — notes mention it.'
      : 'NO freezer, thaw, defrost, or pull-out steps.'
  )
  lines.push(
    pantry
      ? 'Pantry steps OK — notes mention it.'
      : 'NO pantry or grab-from-pantry steps.'
  )

  if (ctx.shoppingOnList.length > 0) {
    lines.push(
      `Already on shopping list (do not suggest again): ${ctx.shoppingOnList.slice(0, 14).join(', ')}`
    )
  }

  if (notes) {
    lines.push(`User notes (ground truth):\n${notes}`)
  } else {
    lines.push('User notes: none — cook steps for the meal only, no invented prep.')
  }

  return lines.join('\n')
}
