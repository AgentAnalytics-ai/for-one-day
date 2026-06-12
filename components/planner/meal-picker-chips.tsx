'use client'

import { useMemo, useState } from 'react'
import {
  MEAL_MOODS,
  suggestionsForMood,
  type MealMoodId,
} from '@/lib/meal-moods'

type MealPickerChipsProps = {
  favoriteTitles: string[]
  recentDinners: string[]
  selectedTitle: string
  onSelectTitle: (title: string) => void
  /** Hide mood row when week plan already set the meal */
  compact?: boolean
}

export function MealPickerChips({
  favoriteTitles,
  recentDinners,
  selectedTitle,
  onSelectTitle,
  compact = false,
}: MealPickerChipsProps) {
  const [moodId, setMoodId] = useState<MealMoodId>(
    favoriteTitles.length > 0 ? 'ours' : 'easy'
  )

  const suggestions = useMemo(
    () => suggestionsForMood(moodId, favoriteTitles, recentDinners),
    [moodId, favoriteTitles, recentDinners]
  )

  if (compact) return null

  return (
    <div className="space-y-3">
      <div>
        <p className="section-label mb-2">Pick a mood</p>
        <div className="flex flex-wrap gap-2">
          {MEAL_MOODS.map((mood) => {
            const selected = moodId === mood.id
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => setMoodId(mood.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-smooth ${
                  selected
                    ? 'border-primary-900 bg-primary-900 text-white'
                    : 'border-[#E7E2DA] bg-white text-primary-900 hover:border-amber-200'
                }`}
              >
                {mood.label}
              </button>
            )
          })}
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div>
          <p className="section-label mb-2">Tap a meal</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((title) => {
              const selected =
                selectedTitle.trim().toLowerCase() === title.toLowerCase()
              return (
                <button
                  key={`${moodId}-${title}`}
                  type="button"
                  onClick={() => onSelectTitle(title)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth ${
                    selected
                      ? 'border-amber-400 bg-amber-100/90 text-amber-950'
                      : 'border-[#E7E2DA] bg-white text-primary-900 hover:border-amber-200'
                  }`}
                >
                  {title}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
