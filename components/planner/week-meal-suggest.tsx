'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Loader2, Sparkles, X } from 'lucide-react'
import {
  runWeekMealSuggest,
  saveWeekMealSuggestions,
} from '@/app/actions/week-meal-suggest-actions'
import type { WeekMealDaySuggestion, WeekMealSuggestPlan } from '@/lib/week-meal-suggest-ai'
import {
  WEEK_PLAN_QUICK_MOODS,
  weekSuggestNoteForMood,
  type MealMoodId,
} from '@/lib/meal-moods'

type WeekMealSuggestProps = {
  canUse: boolean
}

export function WeekMealSuggest({ canUse }: WeekMealSuggestProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notes, setNotes] = useState('')
  const [includeBreakfast, setIncludeBreakfast] = useState(true)
  const [includeLunch, setIncludeLunch] = useState(true)
  const [includeDinner, setIncludeDinner] = useState(true)
  const [plan, setPlan] = useState<WeekMealSuggestPlan | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [savedBanner, setSavedBanner] = useState<string | null>(null)
  const [weekMood, setWeekMood] = useState<MealMoodId | 'variety' | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => setMounted(true), [])

  const reset = useCallback(() => {
    setPlan(null)
    setSelected(new Set())
    setError(null)
    setSavedBanner(null)
    setWeekMood(null)
  }, [])

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 320)
      return () => window.clearTimeout(t)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, reset])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const openSheet = () => {
    reset()
    setOpen(true)
  }

  const handleRun = () => {
    setError(null)
    setSavedBanner(null)
    startTransition(async () => {
      const moodNote = weekMood ? weekSuggestNoteForMood(weekMood) : undefined
      const combinedNotes = [moodNote, notes.trim()].filter(Boolean).join(' ')
      const result = await runWeekMealSuggest({
        notes: combinedNotes || undefined,
        includeBreakfast,
        includeLunch,
        includeDinner,
      })
      if (!result.success || !result.plan) {
        setError(result.error ?? 'Could not line up ideas.')
        return
      }
      setPlan(result.plan)
      setSelected(new Set(result.plan.days.map((d) => d.planDate)))
    })
  }

  const handleSave = () => {
    if (!plan) return
    setError(null)
    const days = plan.days.filter((d) => selected.has(d.planDate))
    startTransition(async () => {
      const result = await saveWeekMealSuggestions(days)
      if (!result.success) {
        setError(result.error ?? 'Could not save.')
        return
      }
      setSavedBanner(
        result.saved === 1
          ? '1 day added to your week'
          : `${result.saved} days added to your week`
      )
    })
  }

  const toggleDay = (planDate: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(planDate)) next.delete(planDate)
      else next.add(planDate)
      return next
    })
  }

  const updateDay = (
    planDate: string,
    slot: 'breakfast' | 'lunch' | 'dinner',
    value: string
  ) => {
    if (!plan) return
    setPlan({
      days: plan.days.map((d) =>
        d.planDate === planDate ? { ...d, [slot]: value || null } : d
      ),
    })
  }

  if (!canUse) return null

  const sheet =
    open && mounted
      ? createPortal(
          <div
            className="sheet-backdrop-enter fixed inset-0 z-[100] flex items-end justify-center bg-primary-900/50 backdrop-blur-[3px] sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="week-meal-suggest-title"
            onClick={() => setOpen(false)}
          >
            <div
              className="sheet-panel-enter flex max-h-[min(92dvh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-[#FAF7F2] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-[#D4CFC6]" />
              </div>

              <header className="flex items-start justify-between gap-3 border-b border-[#E7E2DA] px-5 py-4">
                <div>
                  <h2
                    id="week-meal-suggest-title"
                    className="font-serif text-xl font-medium text-primary-900"
                  >
                    Ideas for this week
                  </h2>
                  <p className="mt-0.5 text-sm text-[#5C6478]">
                    Breakfast, lunch, and dinner — tweak, then add to your week
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="touch-tablet rounded-full p-2 text-[#5C6478] hover:bg-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {savedBanner ? (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
                    {savedBanner}
                  </div>
                ) : null}

                {!plan ? (
                  <div className="space-y-4 pb-2">
                    <div>
                      <p className="section-label mb-2">This week feels like</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {WEEK_PLAN_QUICK_MOODS.map((mood) => {
                          const selected = weekMood === mood.id
                          return (
                            <button
                              key={mood.id}
                              type="button"
                              onClick={() =>
                                setWeekMood(selected ? null : mood.id)
                              }
                              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth ${
                                selected
                                  ? 'border-amber-400 bg-amber-100/90 text-amber-950'
                                  : 'border-[#E7E2DA] bg-white text-primary-900 hover:border-amber-200'
                              }`}
                            >
                              {mood.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <fieldset className="flex flex-wrap gap-2">
                      <legend className="section-label mb-2 w-full">Include</legend>
                      {(
                        [
                          ['Breakfast', includeBreakfast, setIncludeBreakfast],
                          ['Lunch', includeLunch, setIncludeLunch],
                          ['Dinner', includeDinner, setIncludeDinner],
                        ] as const
                      ).map(([label, on, setOn]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setOn(!on)}
                          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth ${
                            on
                              ? 'border-primary-900 bg-primary-900 text-white'
                              : 'border-[#E7E2DA] bg-white text-[#5C6478]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </fieldset>

                    <label className="block">
                      <span className="section-label mb-1.5 block">Anything to plan around?</span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Easy lunches, one GF, use our taco night twice…"
                        className="field-input resize-none"
                      />
                    </label>

                    {error ? (
                      <p className="text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3 pb-2">
                    {plan.days.map((day) => (
                      <DaySuggestionCard
                        key={day.planDate}
                        day={day}
                        checked={selected.has(day.planDate)}
                        onToggle={() => toggleDay(day.planDate)}
                        onChange={updateDay}
                        showBreakfast={includeBreakfast}
                        showLunch={includeLunch}
                        showDinner={includeDinner}
                      />
                    ))}
                    {error ? (
                      <p className="text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <footer className="shrink-0 border-t border-[#E7E2DA] bg-[#FAF7F2] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {!plan ? (
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={isPending || (!includeBreakfast && !includeLunch && !includeDinner)}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lining up the week…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Suggest our week
                      </>
                    )}
                  </button>
                ) : savedBanner ? (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full py-3 text-base"
                  >
                    Done
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isPending || selected.size === 0}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        `Add ${selected.size} day${selected.size === 1 ? '' : 's'} to week`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      disabled={isPending}
                      className="btn-secondary py-3 text-base sm:px-5"
                    >
                      Start over
                    </button>
                  </div>
                )}
              </footer>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="inline-flex items-center gap-2 rounded-full border border-[#E7E2DA] bg-white px-4 py-2.5 text-sm font-medium text-primary-900 shadow-sm hover:border-amber-200 hover:bg-amber-50/50"
      >
        <CalendarDays className="h-4 w-4 text-amber-800" />
        Ideas for this week
      </button>
      {sheet}
    </>
  )
}

function DaySuggestionCard({
  day,
  checked,
  onToggle,
  onChange,
  showBreakfast,
  showLunch,
  showDinner,
}: {
  day: WeekMealDaySuggestion
  checked: boolean
  onToggle: () => void
  onChange: (planDate: string, slot: 'breakfast' | 'lunch' | 'dinner', value: string) => void
  showBreakfast: boolean
  showLunch: boolean
  showDinner: boolean
}) {
  return (
    <article
      className={`rounded-2xl border px-4 py-3 transition-smooth ${
        checked ? 'border-amber-200 bg-white' : 'border-[#E7E2DA] bg-white/60 opacity-80'
      }`}
    >
      <div className="mb-2 flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-[#D4CFC6] text-primary-900"
          aria-label={`Include ${day.weekday}`}
        />
        <p className="font-serif text-base font-medium text-primary-900">{day.weekday}</p>
      </div>
      <div className="space-y-2">
        {showBreakfast ? (
          <MealSlotInput
            label="Breakfast"
            value={day.breakfast ?? ''}
            onChange={(v) => onChange(day.planDate, 'breakfast', v)}
          />
        ) : null}
        {showLunch ? (
          <MealSlotInput
            label="Lunch"
            value={day.lunch ?? ''}
            onChange={(v) => onChange(day.planDate, 'lunch', v)}
          />
        ) : null}
        {showDinner ? (
          <MealSlotInput
            label="Dinner"
            value={day.dinner ?? ''}
            onChange={(v) => onChange(day.planDate, 'dinner', v)}
            emphasized
          />
        ) : null}
      </div>
    </article>
  )
}

function MealSlotInput({
  label,
  value,
  onChange,
  emphasized = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  emphasized?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5C6478]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-0.5 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
          emphasized
            ? 'border-amber-100 font-medium text-primary-900'
            : 'border-[#E7E2DA] text-primary-900'
        }`}
      />
    </label>
  )
}
