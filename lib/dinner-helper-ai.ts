import { openai } from '@/lib/ai'
import { stripStepPrefix } from '@/lib/dinner-helper-format'

export type DinnerHelperPlan = {
  mealTitle: string
  rightNow: string[]
  timeline: Array<{ label: string; step: string }>
  cookSteps: string[]
  shoppingSuggestions: string[]
}

export async function generateDinnerHelperPlan(params: {
  mealHint: string
  notes?: string
  servingTime?: string
  nowLabel: string
  timezone: string
  /** Other household members' first names — use these, never "wife/husband". */
  householdNames?: string[]
}): Promise<DinnerHelperPlan | null> {
  if (!openai) return null

  const mealHint = params.mealHint.trim() || 'Dinner tonight'
  const notes = params.notes?.trim()
  const names = (params.householdNames ?? []).filter(Boolean)

  const system = `You help a household get dinner on the table tonight — calm, practical, like a friend in the kitchen.
Write ONE short playbook from the meal name and their notes. You cannot open recipe links or Pinterest.

Structure:
1. rightNow — 2-3 immediate actions (text someone by first name, pull from freezer, start water).
2. timeline — clock order from now until plates hit the table. Prep and cooking here. One short sentence per step.
3. cookSteps — empty array unless timeline misses a technique detail.
4. shoppingSuggestions — only items they may still need.

Rules:
- Use household first names when texting someone: ${names.length ? names.join(', ') : 'use names from their notes'}.
- NEVER say "your wife", "your husband", or generic spouse labels — first names only.
- Keep each step under 12 words when possible. Large readable sentences.
- Never repeat timeline content in cookSteps.
- No numbered prefixes in strings.
- mealTitle: short title case, not ALL CAPS.
Return ONLY valid JSON. No markdown.`

  const user = `Household timezone: ${params.timezone}
Current local time: ${params.nowLabel}
Target dinner time: ${params.servingTime || 'around 6:00 PM'}
${names.length ? `Household (first names): ${names.join(', ')}` : ''}

Meal: ${mealHint}
${notes ? `What they told you: ${notes}` : ''}

JSON schema:
{
  "mealTitle": "short title for tonight's dinner card",
  "rightNow": ["2-3 immediate actions"],
  "timeline": [{"label": "5:30 PM", "step": "single action at this time"}, ...],
  "cookSteps": ["optional extra stove detail — empty array if timeline is enough"],
  "shoppingSuggestions": ["items to buy — empty array if none"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.5,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw) as DinnerHelperPlan
    if (!parsed.mealTitle || !Array.isArray(parsed.rightNow)) return null

    const titleCase = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())

    return {
      mealTitle: titleCase(String(parsed.mealTitle)),
      rightNow: (parsed.rightNow ?? [])
        .map((s) => stripStepPrefix(String(s)))
        .filter(Boolean)
        .slice(0, 4),
      timeline: (parsed.timeline ?? [])
        .filter((t) => t?.step)
        .map((t) => ({
          label: String(t.label || '').trim(),
          step: stripStepPrefix(String(t.step)),
        }))
        .slice(0, 10),
      cookSteps: (parsed.cookSteps ?? [])
        .map((s) => stripStepPrefix(String(s)))
        .filter(Boolean)
        .slice(0, 8),
      shoppingSuggestions: (parsed.shoppingSuggestions ?? [])
        .map(String)
        .filter(Boolean)
        .slice(0, 12),
    }
  } catch (error) {
    console.error('generateDinnerHelperPlan:', error)
    return null
  }
}
