'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { ChefHat, ChevronDown, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import {
  applyDinnerHelperResults,
  runDinnerHelper,
} from '@/app/actions/dinner-helper-actions'
import { getMealPickerContext } from '@/app/actions/meal-picker-actions'
import {
  getMealIdeas,
  saveMealIdea,
  type MealIdea,
} from '@/app/actions/meal-idea-actions'
import type { DinnerHelperPlan } from '@/lib/dinner-helper-ai'
import { DinnerWalkthrough } from '@/components/planner/dinner-walkthrough'
import { MealPickerChips } from '@/components/planner/meal-picker-chips'
import { MealNoteChips } from '@/components/planner/meal-note-chips'

type DinnerHelperProps = {
  planDate: string
  initialMealTitle?: string | null
  canUse: boolean
  defaultOpen?: boolean
  variant?: 'button' | 'inline'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export function DinnerHelper({
  planDate,
  initialMealTitle,
  canUse,
  defaultOpen = false,
  variant = 'button',
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: DinnerHelperProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [mounted, setMounted] = useState(false)
  const [mealHint, setMealHint] = useState(initialMealTitle ?? '')
  const [fromWeekPlan, setFromWeekPlan] = useState(Boolean(initialMealTitle?.trim()))
  const [changingMeal, setChangingMeal] = useState(false)
  const [notes, setNotes] = useState('')
  const [servingTime, setServingTime] = useState('6:00 PM')
  const [plan, setPlan] = useState<DinnerHelperPlan | null>(null)
  const [selectedShop, setSelectedShop] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [savedBanner, setSavedBanner] = useState<string | null>(null)
  const [mealIdeas, setMealIdeas] = useState<MealIdea[]>([])
  const [favoriteTitles, setFavoriteTitles] = useState<string[]>([])
  const [recentDinners, setRecentDinners] = useState<string[]>([])
  const [householdNames, setHouseholdNames] = useState<string[]>([])
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [contextLoading, setContextLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const mealInputRef = useRef<HTMLInputElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next)
      else setUncontrolledOpen(next)
    },
    [isControlled, onOpenChange]
  )

  const resetPlan = useCallback(() => {
    setPlan(null)
    setSelectedShop(new Set())
    setError(null)
    setSavedBanner(null)
    setSelectedIdeaId(null)
    setShowDetails(false)
    setNotes('')
    setChangingMeal(false)
  }, [])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (initialMealTitle?.trim()) {
      setMealHint(initialMealTitle)
      setFromWeekPlan(true)
      setChangingMeal(false)
    }
  }, [initialMealTitle])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(resetPlan, 320)
      return () => window.clearTimeout(timer)
    }
    const needsPicker = !mealHint.trim() || changingMeal
    if (!plan && needsPicker) {
      const focusTimer = window.setTimeout(() => mealInputRef.current?.focus(), 200)
      return () => window.clearTimeout(focusTimer)
    }
  }, [open, resetPlan, plan, mealHint, changingMeal])

  useEffect(() => {
    if (!open || !canUse) return
    setContextLoading(true)
    Promise.all([getMealPickerContext(), getMealIdeas()])
      .then(([ctx, ideasRes]) => {
        if (ctx.success) {
          setFavoriteTitles(ctx.favoriteTitles)
          setRecentDinners(ctx.recentDinners)
          setHouseholdNames(ctx.householdNames)
          if (!initialMealTitle?.trim() && ctx.tonightTitle) {
            setMealHint((prev) => prev.trim() || ctx.tonightTitle || '')
            setFromWeekPlan(true)
          }
        }
        if (ideasRes.success) setMealIdeas(ideasRes.ideas)
      })
      .finally(() => setContextLoading(false))
  }, [open, canUse, initialMealTitle])

  const selectTitle = (title: string) => {
    setMealHint(title)
    setFromWeekPlan(false)
    setChangingMeal(false)
    setSelectedIdeaId(null)
    const match = mealIdeas.find((i) => i.title.toLowerCase() === title.toLowerCase())
    if (match) {
      setSelectedIdeaId(match.id)
      if (match.notes) setNotes(match.notes)
    }
    setError(null)
  }

  const handleMealChange = (value: string) => {
    setMealHint(value)
    setFromWeekPlan(false)
    if (selectedIdeaId) setSelectedIdeaId(null)
  }

  const handleSaveFavorite = () => {
    if (!mealHint.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await saveMealIdea({ title: mealHint.trim() })
      if (!result.success || !result.idea) {
        setError(result.error ?? 'Could not save favorite')
        return
      }
      setMealIdeas((prev) => [result.idea!, ...prev.filter((i) => i.id !== result.idea!.id)])
      setFavoriteTitles((prev) => [result.idea!.title, ...prev.filter((t) => t !== result.idea!.title)])
      setSelectedIdeaId(result.idea.id)
    })
  }

  const handleRun = () => {
    setError(null)
    setSavedBanner(null)
    startTransition(async () => {
      const result = await runDinnerHelper({
        mealHint,
        notes: notes || undefined,
        servingTime,
      })
      if (!result.success || !result.plan) {
        setError(result.error ?? 'Couldn’t pull this together — try again.')
        return
      }
      setPlan(result.plan)
      setMealHint(result.plan.mealTitle)
      setSelectedShop(new Set(result.plan.shoppingSuggestions.map((_, i) => i)))
    })
  }

  const handleApply = (saveMeal: boolean) => {
    if (!plan) return
    setError(null)
    startTransition(async () => {
      const items = plan.shoppingSuggestions.filter((_, i) => selectedShop.has(i))
      const result = await applyDinnerHelperResults({
        planDate,
        mealTitle: saveMeal ? plan.mealTitle : undefined,
        shoppingItems: items,
      })
      if (!result.success) {
        setError(result.error ?? 'Could not save')
        return
      }
      const parts: string[] = []
      if (result.mealSaved) parts.push('Set for tonight — everyone sees it on Today')
      if (result.itemsAdded > 0) {
        parts.push(
          result.itemsAdded === 1
            ? '1 thing on Groceries'
            : `${result.itemsAdded} on Groceries`
        )
      }
      setSavedBanner(parts.join(' · ') || 'You’re set')
    })
  }

  const toggleShop = (index: number) => {
    setSelectedShop((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const openSheet = () => {
    resetPlan()
    if (initialMealTitle?.trim()) {
      setMealHint(initialMealTitle)
      setFromWeekPlan(true)
    }
    setOpen(true)
  }

  const weekPlanLocked = fromWeekPlan && mealHint.trim() && !changingMeal
  const showPicker = changingMeal || (!weekPlanLocked && !mealHint.trim())

  if (!canUse) {
    return (
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C6478] hover:text-primary-900"
      >
        <ChefHat className="h-3.5 w-3.5" />
        Need a hand with dinner? — Pro
      </Link>
    )
  }

  const sheet =
    open && mounted
      ? createPortal(
          <div
            className="sheet-backdrop-enter fixed inset-0 z-[100] flex items-end justify-center bg-primary-900/50 backdrop-blur-[3px] sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dinner-helper-title"
            onClick={() => setOpen(false)}
          >
            <div
              className="sheet-panel-enter flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-[#FAF7F2] shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-[#D4CFC6]" />
              </div>

              <header className="flex items-start justify-between gap-3 border-b border-[#E7E2DA] px-5 py-4 sm:pt-4">
                <div>
                  <h2
                    id="dinner-helper-title"
                    className="font-serif text-xl font-medium text-primary-900"
                  >
                    Dinner tonight
                  </h2>
                  <p className="mt-0.5 text-sm text-[#5C6478]">
                    {weekPlanLocked
                      ? 'From your week — walk through or change it'
                      : 'Tap a meal or pick a mood — then walk through it'}
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href="/lists" className="btn-secondary text-xs">
                        Open Lists
                      </Link>
                      <Link
                        href="/dashboard"
                        className="text-xs font-medium text-primary-900 hover:underline"
                      >
                        Back to Today
                      </Link>
                    </div>
                  </div>
                ) : null}

                {!plan ? (
                  <div className="space-y-4 pb-2">
                    {weekPlanLocked ? (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">
                          From your week
                        </p>
                        <p className="mt-1 font-serif text-xl font-medium text-primary-900">
                          {mealHint}
                        </p>
                        <button
                          type="button"
                          onClick={() => setChangingMeal(true)}
                          className="mt-2 text-sm font-medium text-[#5C6478] hover:text-primary-900 hover:underline"
                        >
                          Change meal
                        </button>
                      </div>
                    ) : null}

                    {showPicker ? (
                      contextLoading ? (
                        <p className="text-sm text-[#5C6478]">Loading your meals…</p>
                      ) : (
                        <MealPickerChips
                          favoriteTitles={favoriteTitles}
                          recentDinners={recentDinners}
                          selectedTitle={mealHint}
                          onSelectTitle={selectTitle}
                        />
                      )
                    ) : null}

                    {!weekPlanLocked ? (
                      <label className="block">
                        <span className="section-label mb-1.5 block">Or type a meal</span>
                        <input
                          ref={mealInputRef}
                          type="text"
                          value={mealHint}
                          onChange={(e) => handleMealChange(e.target.value)}
                          placeholder="Garlic butter steak…"
                          className="field-input text-base"
                          autoComplete="off"
                        />
                      </label>
                    ) : null}

                    {mealHint.trim() && !selectedIdeaId ? (
                      <button
                        type="button"
                        onClick={handleSaveFavorite}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5C6478] transition-smooth hover:text-primary-900"
                      >
                        <Plus className="h-4 w-4" />
                        Save to favorites
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setShowDetails((v) => !v)}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E7E2DA]/80 bg-white/50 px-3.5 py-2.5 text-left text-sm font-medium text-[#5C6478] transition-smooth hover:border-[#D4CFC6]"
                    >
                      <span>Anything to add?</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showDetails ? (
                      <div className="space-y-3 rounded-xl border border-[#E7E2DA]/80 bg-white/50 p-3.5">
                        <div>
                          <span className="section-label mb-2 block">Quick adds</span>
                          <MealNoteChips
                            notes={notes}
                            householdNames={householdNames}
                            onChange={setNotes}
                          />
                        </div>
                        <label className="block">
                          <span className="section-label mb-1.5 block">Notes</span>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Anything else for tonight…"
                            rows={2}
                            className="field-input resize-none"
                          />
                        </label>
                        <label className="block">
                          <span className="section-label mb-1.5 block">Plates on the table by</span>
                          <input
                            type="text"
                            value={servingTime}
                            onChange={(e) => setServingTime(e.target.value)}
                            className="field-input max-w-[10rem]"
                          />
                        </label>
                      </div>
                    ) : null}

                    {error ? (
                      <p className="text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <DinnerWalkthrough
                      key={plan.mealTitle}
                      plan={plan}
                      servingTime={servingTime}
                      selectedShop={selectedShop}
                      onToggleShop={toggleShop}
                      onSave={() => handleApply(true)}
                      onSaveListsOnly={() => handleApply(false)}
                      onStartOver={resetPlan}
                      isPending={isPending}
                    />
                    {error ? (
                      <p className="mt-3 text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              {!savedBanner && !plan ? (
                <footer className="shrink-0 border-t border-[#E7E2DA] bg-[#FAF7F2] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={isPending || !mealHint.trim()}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lining up your steps…
                      </>
                    ) : (
                      'Walk me through it'
                    )}
                  </button>
                </footer>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      {!hideTrigger && variant === 'button' ? (
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition-smooth hover:bg-amber-100/90 active:scale-[0.98]"
        >
          <ChefHat className="h-3.5 w-3.5" />
          Need a hand?
        </button>
      ) : null}

      {sheet}
    </>
  )
}
