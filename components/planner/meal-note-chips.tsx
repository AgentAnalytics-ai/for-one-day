'use client'

import { buildMealNoteChips, notesIncludePhrase, toggleNotePhrase } from '@/lib/meal-note-chips'

type MealNoteChipsProps = {
  notes: string
  householdNames: string[]
  onChange: (notes: string) => void
}

export function MealNoteChips({ notes, householdNames, onChange }: MealNoteChipsProps) {
  const chips = buildMealNoteChips(householdNames)

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const active = notesIncludePhrase(notes, chip.phrase)
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(toggleNotePhrase(notes, chip.phrase))}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth ${
              active
                ? 'border-amber-400 bg-amber-100/90 text-amber-950'
                : 'border-[#E7E2DA] bg-white text-[#5C6478] hover:border-[#D4CFC6]'
            }`}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
