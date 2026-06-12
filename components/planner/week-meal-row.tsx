'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, Pencil, Plus, X } from 'lucide-react'
import { clearMealPlan, setMealPlan, type MealPlanRow } from '@/app/actions/meal-actions'
import { getMealPickerContext } from '@/app/actions/meal-picker-actions'
import { DinnerHelper } from '@/components/planner/dinner-helper'
import { MealPickerChips } from '@/components/planner/meal-picker-chips'
import { ScheduleEventRow } from '@/components/planner/schedule-event-row'
import type { HouseholdScheduleEvent } from '@/lib/calendar-merge'
import type { HouseholdWeekDay } from '@/lib/household-dates'
import { cn } from '@/lib/utils'

type WeekMealRowProps = {
  day: HouseholdWeekDay & { meal: MealPlanRow | null }
  canEdit: boolean
  events: HouseholdScheduleEvent[]
  calendarConnected?: boolean
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
  const [justSaved, setJustSaved] = useState(false)

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
      } else {
        setJustSaved(true)
        window.setTimeout(() => setJustSaved(false), 900)
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

  const hasDinner = Boolean(meal?.title?.trim())

  return (
    <article
      id={day.isToday ? 'today' : sectionId}
      className={cn(
        'week-meal-row surface-card overflow-hidden transition-colors',
        day.isToday && 'border-l-[3px] border-l-amber-400',
        justSaved && 'meal-save-glow',
        !hasDinner && !editing && 'border-dashed border-[#D4CFC6] bg-white/80'
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#F0EBE3]/80 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5C6478]">
            {day.isToday ? 'Tonight' : day.weekday}
          </p>
          <h3 className="font-serif text-lg font-medium text-primary-900 sm:text-xl">
            {day.weekdayShort} {day.dateNum}
          </h3>
        </div>
        {canEdit && !editing ? (
          <button
            type="button"
            onClick={openEdit}
            className="touch-tablet inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E7E2DA] bg-white px-3 py-2 text-xs font-medium text-primary-900 transition-colors hover:border-[#D4CFC6] hover:bg-[#FAF7F2]"
            aria-label={hasDinner ? `Change dinner for ${day.weekday}` : `Plan dinner for ${day.weekday}`}
          >
            {hasDinner ? (
              <>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Change
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Plan
              </>
            )}
          </button>
        ) : null}
      </div>

      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
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
        ) : hasDinner ? (
          <div className="space-y-2">
            {(meal?.breakfastTitle || meal?.lunchTitle) && (
              <div className="space-y-0.5 text-sm text-[#5C6478]">
                {meal?.breakfastTitle ? (
                  <p>
                    <span className="font-medium text-primary-900/70">Breakfast · </span>
                    {meal.breakfastTitle}
                  </p>
                ) : null}
                {meal?.lunchTitle ? (
                  <p>
                    <span className="font-medium text-primary-900/70">Lunch · </span>
                    {meal.lunchTitle}
                  </p>
                ) : null}
              </div>
            )}
            <p className="font-serif text-xl font-medium leading-snug text-primary-900 sm:text-2xl">
              {meal!.title}
            </p>
            <p className="text-xs text-[#5C6478]">Dinner planned</p>
          </div>
        ) : (
          <p className="text-sm text-[#5C6478]">
            No dinner planned yet — tap <span className="font-medium text-primary-900">Plan</span>{' '}
            to choose.
          </p>
        )}
      </div>

      {day.isToday && canEdit && hasDinner && !editing ? (
        <div className="border-t border-[#F0EBE3]/80 px-4 py-2.5 sm:px-5">
          <DinnerHelper
            planDate={day.dateKey}
            initialMealTitle={meal?.title}
            canUse={canEdit}
            defaultOpen={openDinnerHelper}
          />
        </div>
      ) : null}

      {showInlineEvents ? (
        <div className="border-t border-[#F0EBE3]/80 px-4 py-3 sm:px-5">
          {events.length > 0 ? (
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
          )}
        </div>
      ) : null}

      {error ? (
        <p className="px-4 pb-3 text-sm text-red-700 sm:px-5" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}
