import { openai } from '@/lib/ai'
import { stripStepPrefix } from '@/lib/dinner-helper-format'
import { normalizeMealTitle } from '@/lib/meal-ai-shared'
import {
  buildGroundingFactsBlock,
  filterShoppingSuggestions,
  isStepGrounded,
  minutesUntilServe,
  type DinnerWalkContext,
} from '@/lib/dinner-helper-grounding'

export type DinnerHelperWalkStep = {
  time: string | null
  text: string
  phase: 'now' | 'prep' | 'cook' | 'serve'
}

export type DinnerHelperPlan = {
  mealTitle: string
  steps: DinnerHelperWalkStep[]
  shoppingSuggestions: string[]
  /** @deprecated Legacy — flattened into steps when present */
  rightNow?: string[]
  timeline?: Array<{ label: string; step: string }>
  cookSteps?: string[]
}

const VALID_PHASES = new Set<DinnerHelperWalkStep['phase']>([
  'now',
  'prep',
  'cook',
  'serve',
])

const MIN_STEPS = 4

const SYSTEM_PROMPT = `You write a tap-through dinner plan for tonight — one short action per step.

Rules:
- Follow GROUNDING FACTS exactly. If facts say NO freezer/delegation/pantry, those steps must not appear.
- Each step: one imperative action, 6–12 words, no numbering in text.
- Phases: now | prep | cook | serve. Optional realistic times on cook/serve (12-hour).
- shoppingSuggestions: only items not already on their shopping list — empty array if none.
- Calm and direct — not a recipe blog.

Examples (grounding):
- Meal "Spaghetti", no notes → prep/cook/serve only; no texting, no freezer.
- Meal "Tacos", notes "Sara starts rice, one GF" → include Sara step + GF step; nothing else invented.

Return ONLY valid JSON. No markdown.`

function normalizeSteps(
  parsed: DinnerHelperPlan & {
    rightNow?: string[]
    timeline?: Array<{ label: string; step: string }>
  }
): DinnerHelperWalkStep[] {
  let steps: DinnerHelperWalkStep[] = (parsed.steps ?? [])
    .filter((s) => s?.text)
    .map((s) => ({
      time: s.time ? String(s.time).trim() : null,
      text: stripStepPrefix(String(s.text)),
      phase: VALID_PHASES.has(s.phase) ? s.phase : 'cook',
    }))
    .slice(0, 14)

  if (steps.length === 0 && Array.isArray(parsed.rightNow)) {
    steps = (parsed.rightNow ?? []).map((text) => ({
      time: null,
      text: stripStepPrefix(String(text)),
      phase: 'now' as const,
    }))
    for (const row of parsed.timeline ?? []) {
      if (!row?.step) continue
      steps.push({
        time: String(row.label || '').trim() || null,
        text: stripStepPrefix(String(row.step)),
        phase: 'cook',
      })
    }
  }

  return steps
}

function buildUserPrompt(ctx: DinnerWalkContext, mealHint: string, extra?: string): string {
  const groundingBlock = buildGroundingFactsBlock(ctx)
  return `${extra ? `${extra}\n\n` : ''}Timezone: ${ctx.timezone}
Now: ${ctx.nowLabel}
Dinner on the table: ${ctx.servingTime}

Meal: ${mealHint}

GROUNDING FACTS:
${groundingBlock}

JSON:
{
  "mealTitle": "short title case name",
  "steps": [
    { "time": null, "text": "one grounded action", "phase": "prep" },
    { "time": "5:30 PM", "text": "one grounded action", "phase": "cook" }
  ],
  "shoppingSuggestions": []
}`
}

async function callDinnerPlan(
  userContent: string
): Promise<(DinnerHelperPlan & { rightNow?: string[]; timeline?: Array<{ label: string; step: string }> }) | null> {
  if (!openai) return null

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return null
  return JSON.parse(raw)
}

export async function generateDinnerHelperPlan(params: {
  mealHint: string
  notes?: string
  servingTime?: string
  nowLabel: string
  timezone: string
  cookName?: string | null
  householdNames?: string[]
  shoppingOnList?: string[]
  now?: Date
}): Promise<DinnerHelperPlan | null> {
  if (!openai) return null

  const mealHint = params.mealHint.trim() || 'Dinner tonight'
  const notes = params.notes?.trim() ?? ''
  const servingTime = params.servingTime?.trim() || '6:00 PM'
  const householdNames = (params.householdNames ?? []).filter(Boolean)
  const shoppingOnList = (params.shoppingOnList ?? []).filter(Boolean)
  const now = params.now ?? new Date()

  const ctx: DinnerWalkContext = {
    mealHint,
    notes,
    servingTime,
    nowLabel: params.nowLabel,
    timezone: params.timezone,
    cookName: params.cookName ?? null,
    householdNames,
    shoppingOnList,
    minutesUntilServe: minutesUntilServe(now, servingTime, params.timezone),
  }

  const grounding = { notes, householdNames }

  try {
    let parsed = await callDinnerPlan(buildUserPrompt(ctx, mealHint))
    if (!parsed?.mealTitle) return null

    let steps = normalizeSteps(parsed).filter((s) => isStepGrounded(s.text, grounding))

    if (steps.length < MIN_STEPS) {
      parsed = await callDinnerPlan(
        buildUserPrompt(
          ctx,
          mealHint,
          'Previous draft had steps removed for breaking grounding rules. Write 6–10 cook steps for this meal only — no freezer, no texting, no pantry unless notes allow.'
        )
      )
      if (!parsed?.mealTitle) return null
      steps = normalizeSteps(parsed).filter((s) => isStepGrounded(s.text, grounding))
    }

    if (steps.length < MIN_STEPS) return null

    const shoppingSuggestions = filterShoppingSuggestions(
      (parsed.shoppingSuggestions ?? []).map(String).filter(Boolean).slice(0, 12),
      shoppingOnList
    )

    return {
      mealTitle: normalizeMealTitle(String(parsed.mealTitle)),
      steps,
      shoppingSuggestions,
    }
  } catch (error) {
    console.error('generateDinnerHelperPlan:', error)
    return null
  }
}
