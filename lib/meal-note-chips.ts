export type MealNoteChip = {
  id: string
  label: string
  phrase: string
}

export function buildMealNoteChips(householdNames: string[]): MealNoteChip[] {
  const chips: MealNoteChip[] = [
    { id: 'gf', label: 'One gluten-free', phrase: 'One gluten-free' },
    { id: 'feed-4', label: 'Feeding 4', phrase: 'Feeding 4' },
    { id: 'feed-6', label: 'Feeding 6', phrase: 'Feeding 6' },
    { id: 'kids-early', label: 'Kids eat early', phrase: 'Kids eat early' },
    { id: 'leftovers', label: 'Use leftovers', phrase: 'Use leftovers' },
  ]

  for (const name of householdNames) {
    chips.push({
      id: `help-${name.toLowerCase()}`,
      label: `${name} helps`,
      phrase: `${name} helps with sides`,
    })
  }

  return chips
}

function normalizeNotes(notes: string): string[] {
  return notes
    .split(/[,;]\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function notesIncludePhrase(notes: string, phrase: string): boolean {
  const target = phrase.trim().toLowerCase()
  return normalizeNotes(notes).some((p) => p.toLowerCase() === target)
}

export function toggleNotePhrase(notes: string, phrase: string): string {
  const parts = normalizeNotes(notes)
  const target = phrase.trim()
  const lower = target.toLowerCase()
  const idx = parts.findIndex((p) => p.toLowerCase() === lower)
  if (idx >= 0) {
    parts.splice(idx, 1)
    return parts.join(', ')
  }
  return parts.length > 0 ? `${parts.join(', ')}, ${target}` : target
}
