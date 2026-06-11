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
  recipeLink?: string
  notes?: string
  servingTime?: string
  nowLabel: string
  timezone: string
}): Promise<DinnerHelperPlan | null> {
  if (!openai) return null

  const mealHint = params.mealHint.trim() || 'Dinner tonight'
  const link = params.recipeLink?.trim()
  const notes = params.notes?.trim()

  const system = `You help a busy parent get dinner on the table tonight — like a calm friend in the kitchen, not a chef or an app.
Write ONE playbook, not three versions of the same recipe.

Structure:
1. rightNow — 2-3 immediate actions only (text someone, pull from freezer, start water). Use their notes literally when they ask ("text wife to pull mushrooms out").
2. timeline — the full evening in clock order from current time until plates hit the table. Include prep AND cooking here. Each step is one short sentence. Labels must be realistic times between now and dinner.
3. cookSteps — ONLY detailed stove technique that does NOT fit a timed line (empty array is fine and preferred when timeline covers cooking).
4. shoppingSuggestions — only items they might still need to buy.

Rules:
- Never repeat the same instruction in timeline and cookSteps.
- Do not number steps in strings (no "1." prefix).
- mealTitle: short title case (e.g. "Mushroom cream pasta"), not ALL CAPS.
- Plain language. They can do this.
They may paste a Pinterest link you cannot open — rely on meal hint and notes.
Return ONLY valid JSON. No markdown.`

  const user = `Household timezone: ${params.timezone}
Current local time: ${params.nowLabel}
Target dinner time: ${params.servingTime || 'around 6:00 PM'}

Meal: ${mealHint}
${link ? `Recipe link (for context only): ${link}` : ''}
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
