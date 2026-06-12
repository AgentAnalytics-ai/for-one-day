'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, Pencil, Plus, UtensilsCrossed, X } from 'lucide-react'
import { clearMealPlan, setMealPlan, type MealPlanRow } from '@/app/actions/meal-actions'
import { getMealPickerContext } from '@/app/actions/meal-picker-actions'
import { DinnerHelper } from '@/components/planner/dinner-helper'
import { MealPickerChips } from '@/components/planner/meal-picker-chips'
import { ScheduleEventRow } from '@/components/planner/schedule-event-row'
import type { HouseholdScheduleEvent } from '@/lib/calendar-merge'
import type { HouseholdWeekDay } from '@/lib/household-dates'

type WeekMealRowProps = {
  day: HouseholdWeekDay & { meal: MealPlanRow | null }
  canEdit: boolean
  events: HouseholdScheduleEvent[]
  calendarConnected?: boolean
  /** When false, events live in the schedule panel only (desktop layout). */
  showInlineEvents?: boolean
  openDinnerHelper?: boolean
}

export function WeekMealRow({
  day,
  canEdit,
  events,
  calendarConnected = false,
  showInlineEvents = true,
  openDinnerHelper = false,
}: WeekMealRowProps) {
  const [meal, setMeal] = useState(day.meal)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(day.meal?.title ?? '')
  const [error, setError] = useState<string | null>(null)
  const [favoriteTitles, setFavoriteTitles] = useState<string[]>([])
  const [recentDinners, setRecentDinners] = useState<string[]>([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sectionId = `meal-${day.dateKey}`

  useEffect(() => {
    if (!editing || !canEdit) return
    setPickerLoading(true)
    getMealPickerContext()
      .then((ctx) => {
        if (ctx.success) {
          setFavoriteTitles(ctx.favoriteTitles)
          setRecentDinners(ctx.recentDinners)
        }
      })
      .finally(() => setPickerLoading(false))
  }, [editing, canEdit])

  const openEdit = () => {
    setDraft(meal?.title ?? '')
    setEditing(true)
    setError(null)
  }

  const closeEdit = () => {
    setEditing(false)
    setDraft(meal?.title ?? '')
    setError(null)
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await setMealPlan(day.dateKey, draft)
      if (!result.success) {
        setError(result.error ?? 'Could not save dinner')
        return
      }
      setMeal(result.meal ?? null)
      if (!draft.trim()) {
        setMeal(null)
      }
      setEditing(false)
    })
  }

  const handleClear = () => {
    setError(null)
    startTransition(async () => {
      const result = await clearMealPlan(day.dateKey)
      if (!result.success) {
        setError(result.error ?? 'Could not clear dinner')
        return
      }
      setMeal(null)
      setDraft('')
      setEditing(false)
    })
  }

  return (
    <article
      id={day.isToday ? 'today' : sectionId}
      className={`surface-card p-4 sm:p-5 ${day.isToday ? 'ring-1 ring-primary-200' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-medium text-primary-900">
            {day.isToday ? 'Today' : day.weekday}
            <span className="ml-2 text-sm font-normal text-[#5C6478]">
              {day.weekdayShort}, {day.dateNum}
            </span>
          </h3>
        </div>
        {canEdit && !editing ? (
          <button
            type="button"
            onClick={meal ? openEdit : openEdit}
            className="touch-tablet flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E2DA] bg-white text-primary-900 hover:bg-[#FAF7F2]"
            aria-label={meal ? `Edit dinner for ${day.weekday}` : `Add dinner for ${day.weekday}`}
          >
            {meal ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <div
        className={
          meal || editing
            ? 'mb-4 rounded-2xl border border-[#FDE68A]/80 bg-gradient-to-br from-amber-50/90 to-white px-4 py-3.5'
            : 'mb-1 px-1 py-1'
        }
      >
        {(meal || editing) && (
          <div className="mb-1 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-amber-800/80" strokeWidth={2} />
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6478]">Dinner</p>
          </div>
        )}

        {editing ? (
          <div className="space-y-3">
            {!draft.trim() && !pickerLoading ? (
              <MealPickerChips
                favoriteTitles={favoriteTitles}
                recentDinners={recentDinners}
                selectedTitle={draft}
                onSelectTitle={setDraft}
              />
            ) : pickerLoading ? (
              <p className="text-sm text-[#5C6478]">Loading ideas…</p>
            ) : null}
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  closeEdit()
                }
              }}
              placeholder={draft.trim() ? 'Edit dinner title…' : 'Or type a meal…'}
              disabled={isPending}
              className="field-input border-amber-100 bg-white"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-900 px-4 py-2 text-sm font-medium text-white hover:bg-primary-950 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={closeEdit}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E2DA] px-4 py-2 text-sm font-medium text-[#5C6478]"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              {meal ? (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isPending}
                  className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
                >
                  Clear night
                </button>
              ) : null}
            </div>
          </div>
        ) : meal ? (
          <div className="space-y-1.5">
            {meal.breakfastTitle ? (
              <p className="text-sm text-[#5C6478]">
                <span className="font-medium text-primary-900/80">Breakfast · </span>
                {meal.breakfastTitle}
              </p>
            ) : null}
            {meal.lunchTitle ? (
              <p className="text-sm text-[#5C6478]">
                <span className="font-medium text-primary-900/80">Lunch · </span>
                {meal.lunchTitle}
              </p>
            ) : null}
            <p className="font-serif text-lg font-medium text-primary-900">{meal.title}</p>
          </div>
        ) : null}
      </div>

      {day.isToday && canEdit ? (
        <div className="mb-3">
          <DinnerHelper
            planDate={day.dateKey}
            initialMealTitle={meal?.title}
            canUse={canEdit}
            defaultOpen={openDinnerHelper}
          />
        </div>
      ) : null}

      {showInlineEvents ? (
        events.length > 0 ? (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <ScheduleEventRow event={event} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#5C6478]/80">
            {calendarConnected
              ? 'No events this day'
              : 'No events — connect Google in Settings → Profile'}
          </p>
        )
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}
