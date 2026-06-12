/** Shared meal-title rules for invisible-help AI surfaces. */

export function normalizeMealTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function cleanMealTitleList(titles: string[], max = 24): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of titles) {
    const t = normalizeMealTitle(raw)
    if (!t || t.length > 48) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
    if (out.length >= max) break
  }
  return out
}

export const MEAL_TITLE_RULES = `Meal titles only — 2–5 words, title case, no recipes.
Examples: "Chicken Tacos", "Oatmeal And Fruit", "Turkey Sandwiches".
No steps, no "pull from freezer", no generic filler ("Meal", "Food", "Dinner Idea").`
