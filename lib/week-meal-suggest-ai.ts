import { openai } from '@/lib/ai'
import { cleanMealTitleList, MEAL_TITLE_RULES, normalizeMealTitle } from '@/lib/meal-ai-shared'

export type WeekMealDaySuggestion = {
  planDate: string
  weekday: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
}

export type WeekMealSuggestPlan = {
  days: WeekMealDaySuggestion[]
}

export type WeekMealSuggestInput = {
  timezone: string
  notes?: string
  includeBreakfast: boolean
  includeLunch: boolean
  includeDinner: boolean
  favoriteTitles: string[]
  existingDays: Array<{
    planDate: string
    weekday: string
    breakfast: string | null
    lunch: string | null
    dinner: string | null
    eventCount: number
    isBusy: boolean
  }>
}

const SYSTEM_PROMPT = `You suggest a household meal plan for the current calendar week.

${MEAL_TITLE_RULES}

Planning rules:
- Match the user's notes (dietary, easy nights, kid-friendly, etc.).
- Prefer favorites when they fit — rotate them, do not repeat the same dinner twice in one week.
- Busy days (many calendar events): simpler dinners (sheet pan, tacos, pasta, slow cooker).
- Breakfast: quick weekday ideas (oatmeal, eggs, yogurt, toast).
- Lunch: packable or leftover-friendly when possible.
- Keep existing dinners already on the plan unless notes ask to change them.
- Return exactly one entry per day in the input, same planDate order.

Return ONLY valid JSON. No markdown.`

function buildUserPrompt(input: WeekMealSuggestInput): string {
  const flags = [
    input.includeBreakfast ? 'breakfast' : null,
    input.includeLunch ? 'lunch' : null,
    input.includeDinner ? 'dinner' : null,
  ].filter(Boolean)

  const daysBlock = input.existingDays
    .map((d) => {
      const parts = [
        `${d.weekday} (${d.planDate})`,
        d.isBusy ? 'busy day' : `${d.eventCount} events`,
      ]
      if (d.dinner) parts.push(`dinner kept: ${d.dinner}`)
      if (d.breakfast) parts.push(`breakfast kept: ${d.breakfast}`)
      if (d.lunch) parts.push(`lunch kept: ${d.lunch}`)
      return `- ${parts.join(' · ')}`
    })
    .join('\n')

  const favorites =
    input.favoriteTitles.length > 0
      ? `Household favorites:\n${input.favoriteTitles.map((t) => `- ${t}`).join('\n')}`
      : 'Household favorites: none saved yet.'

  const notes = input.notes?.trim()
    ? `Notes (follow):\n${input.notes.trim()}`
    : 'Notes: none — balanced variety for a typical family week.'

  return `Timezone: ${input.timezone}
Suggest: ${flags.join(', ')}

${favorites}

${notes}

Days this week:
${daysBlock}

JSON:
{
  "days": [
    {
      "planDate": "YYYY-MM-DD",
      "weekday": "Mon",
      "breakfast": "Title Or Null",
      "lunch": "Title Or Null",
      "dinner": "Title Or Null"
    }
  ]
}`
}

function normalizeDay(
  raw: WeekMealDaySuggestion,
  input: WeekMealSuggestInput
): WeekMealDaySuggestion | null {
  const existing = input.existingDays.find((d) => d.planDate === raw.planDate)
  if (!existing) return null

  const title = (v: unknown) => {
    if (v == null || v === '') return null
    const t = normalizeMealTitle(String(v))
    return t || null
  }

  return {
    planDate: raw.planDate,
    weekday: existing.weekday,
    breakfast: input.includeBreakfast ? title(raw.breakfast) : existing.breakfast,
    lunch: input.includeLunch ? title(raw.lunch) : existing.lunch,
    dinner: input.includeDinner ? title(raw.dinner) ?? existing.dinner : existing.dinner,
  }
}

export async function generateWeekMealSuggestions(
  input: WeekMealSuggestInput
): Promise<WeekMealSuggestPlan | null> {
  if (!openai) return null
  if (!input.includeBreakfast && !input.includeLunch && !input.includeDinner) {
    return null
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input) },
      ],
      temperature: 0.45,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw) as WeekMealSuggestPlan
    const days = (parsed.days ?? [])
      .map((d) => normalizeDay(d, input))
      .filter((d): d is WeekMealDaySuggestion => Boolean(d))

    if (days.length !== input.existingDays.length) return null

    for (const day of days) {
      if (!day.dinner && input.includeDinner) return null
    }

    return { days }
  } catch (error) {
    console.error('generateWeekMealSuggestions:', error)
    return null
  }
}

export function favoriteTitlesFromIdeas(ideas: Array<{ title: string }>): string[] {
  return cleanMealTitleList(ideas.map((i) => i.title))
}
