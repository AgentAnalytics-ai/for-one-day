import { cleanMealTitleList, normalizeMealTitle } from '@/lib/meal-ai-shared'

export type MealMoodId =
  | 'ours'
  | 'easy'
  | 'comfort'
  | 'mexican'
  | 'italian'
  | 'asian'
  | 'grill'
  | 'healthy'

export type MealMood = {
  id: MealMoodId
  label: string
}

/** Short mood lanes — not a cuisine database. */
export const MEAL_MOODS: MealMood[] = [
  { id: 'ours', label: 'Our rotation' },
  { id: 'easy', label: 'Easy' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'italian', label: 'Italian' },
  { id: 'asian', label: 'Asian' },
  { id: 'grill', label: 'Grill' },
  { id: 'healthy', label: 'Lighter' },
]

const MOOD_STARTERS: Record<Exclude<MealMoodId, 'ours'>, string[]> = {
  easy: [
    'Sheet Pan Chicken',
    'Tacos',
    'Pasta Night',
    'Quesadillas',
    'Soup And Sandwiches',
    'Sloppy Joes',
  ],
  comfort: [
    'Mac And Cheese',
    'Chili',
    'Meatloaf',
    'Chicken Pot Pie',
    'Beef Stew',
    'Baked Ziti',
  ],
  mexican: [
    'Chicken Tacos',
    'Burrito Bowls',
    'Enchiladas',
    'Fajitas',
    'Carnitas',
    'Taco Salad',
  ],
  italian: [
    'Spaghetti',
    'Lasagna',
    'Chicken Parmesan',
    'Margherita Pizza',
    'Penne Marinara',
    'Meatballs And Polenta',
  ],
  asian: [
    'Stir Fry',
    'Fried Rice',
    'Teriyaki Chicken',
    'Beef And Broccoli',
    'Ramen Night',
    'Buddha Bowls',
  ],
  grill: [
    'Burgers',
    'Grilled Chicken',
    'Steak Night',
    'Kabobs',
    'Pulled Pork',
    'Brats And Peppers',
  ],
  healthy: [
    'Salmon And Veggies',
    'Grain Bowls',
    'Turkey Lettuce Wraps',
    'Greek Salad Night',
    'White Bean Soup',
    'Roasted Chicken Salad',
  ],
}

export function suggestionsForMood(
  moodId: MealMoodId,
  favorites: string[],
  recentDinners: string[] = []
): string[] {
  if (moodId === 'ours') {
    const rotation = cleanMealTitleList([...favorites, ...recentDinners], 10)
    if (rotation.length > 0) return rotation
    return cleanMealTitleList(MOOD_STARTERS.easy, 6)
  }

  const starters = MOOD_STARTERS[moodId]
  const favLower = new Set(favorites.map((f) => f.toLowerCase()))
  const fromFavorites = favorites.filter((f) =>
    starters.some((s) => s.toLowerCase().includes(f.toLowerCase().split(' ')[0] ?? ''))
  )

  return cleanMealTitleList([...fromFavorites, ...starters, ...favorites], 8)
}

export const WEEK_PLAN_QUICK_MOODS: Array<{
  id: MealMoodId | 'variety'
  label: string
}> = [
  { id: 'ours', label: 'Our rotation' },
  { id: 'easy', label: 'Easy week' },
  { id: 'variety', label: 'More variety' },
  { id: 'healthy', label: 'Lighter week' },
]

export function weekSuggestNoteForMood(moodId: MealMoodId | 'variety'): string | undefined {
  switch (moodId) {
    case 'ours':
      return 'Use our household favorites and recent dinners when possible.'
    case 'easy':
      return 'Easy week — quick dinners on busy nights.'
    case 'variety':
      return 'More variety this week — mix it up from last week.'
    case 'healthy':
      return 'Lighter meals when possible.'
    default:
      return undefined
  }
}

export function pickMealTitle(title: string): string {
  return normalizeMealTitle(title)
}
