import { openai } from '@/lib/ai'

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
Give practical, time-aware guidance: what to do right now, then a simple timeline, then stove steps.
Affirm they can do this; never talk down. Be concise. Plain language only.
They may paste a Pinterest or recipe link you cannot open — rely on the meal hint and their notes.
Return ONLY valid JSON matching the schema. No markdown.`

  const user = `Household timezone: ${params.timezone}
Current local time: ${params.nowLabel}
Target dinner time: ${params.servingTime || 'around 6:00 PM'}

Meal: ${mealHint}
${link ? `Recipe link (for context only): ${link}` : ''}
${notes ? `What they told you: ${notes}` : ''}

JSON schema:
{
  "mealTitle": "short name for tonight's dinner card",
  "rightNow": ["2-4 bullets for what to do immediately at current time"],
  "timeline": [{"label": "5:30 PM", "step": "what to do then"}, ...],
  "cookSteps": ["numbered-style short steps at the stove"],
  "shoppingSuggestions": ["only items they might still need to buy — empty array if none"]
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

    return {
      mealTitle: String(parsed.mealTitle).trim(),
      rightNow: (parsed.rightNow ?? []).map(String).filter(Boolean).slice(0, 5),
      timeline: (parsed.timeline ?? [])
        .filter((t) => t?.step)
        .map((t) => ({ label: String(t.label || ''), step: String(t.step) }))
        .slice(0, 8),
      cookSteps: (parsed.cookSteps ?? []).map(String).filter(Boolean).slice(0, 12),
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
