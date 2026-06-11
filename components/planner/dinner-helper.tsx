'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { ChefHat, Loader2, ShoppingBag, X } from 'lucide-react'
import Link from 'next/link'
import {
  applyDinnerHelperResults,
  runDinnerHelper,
} from '@/app/actions/dinner-helper-actions'
import type { DinnerHelperPlan } from '@/lib/dinner-helper-ai'

type DinnerHelperProps = {
  planDate: string
  initialMealTitle?: string | null
  canUse: boolean
  /** When set, open on mount (e.g. from Today). */
  defaultOpen?: boolean
  variant?: 'button' | 'inline'
  /** Controlled sheet — use with hideTrigger on Today glance card. */
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
  const [recipeLink, setRecipeLink] = useState('')
  const [notes, setNotes] = useState('')
  const [servingTime, setServingTime] = useState('6:00 PM')
  const [plan, setPlan] = useState<DinnerHelperPlan | null>(null)
  const [selectedShop, setSelectedShop] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [savedBanner, setSavedBanner] = useState<string | null>(null)
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
  }, [])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (initialMealTitle) setMealHint(initialMealTitle)
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
    if (!plan) {
      const focusTimer = window.setTimeout(() => mealInputRef.current?.focus(), 120)
      return () => window.clearTimeout(focusTimer)
    }
  }, [open, resetPlan, plan])

  const handleRun = () => {
    setError(null)
    setSavedBanner(null)
    startTransition(async () => {
      const result = await runDinnerHelper({
        mealHint,
        recipeLink: recipeLink || undefined,
        notes: notes || undefined,
        servingTime,
      })
      if (!result.success || !result.plan) {
        setError(result.error ?? 'Couldn’t pull this together — try again.')
        return
      }
      setPlan(result.plan)
      setMealHint(result.plan.mealTitle)
      setSelectedShop(
        new Set(result.plan.shoppingSuggestions.map((_, i) => i))
      )
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
            ? '1 thing on Shopping'
            : `${result.itemsAdded} on Shopping`
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
    setOpen(true)
  }

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
                    The order of things — from right now until plates hit the table
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
                    <label className="block">
                      <span className="section-label mb-1.5 block">What&apos;s cooking?</span>
                      <input
                        ref={mealInputRef}
                        type="text"
                        value={mealHint}
                        onChange={(e) => setMealHint(e.target.value)}
                        placeholder="Garlic butter steak, tacos…"
                        className="field-input"
                        autoComplete="off"
                      />
                    </label>
                    <label className="block">
                      <span className="section-label mb-1.5 block">Got a recipe link?</span>
                      <input
                        type="url"
                        value={recipeLink}
                        onChange={(e) => setRecipeLink(e.target.value)}
                        placeholder="Pinterest or recipe URL"
                        className="field-input"
                      />
                    </label>
                    <label className="block">
                      <span className="section-label mb-1.5 block">What should we know?</span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Feeding 4, have steak in the freezer, one gluten-free…"
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
                    {error ? (
                      <p className="text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-5 pb-4">
                    <section>
                      <h3 className="section-label mb-2">Right now</h3>
                      <ul className="space-y-2">
                        {plan.rightNow.map((step) => (
                          <li
                            key={step}
                            className="rounded-xl border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm text-primary-900"
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {plan.timeline.length > 0 ? (
                      <section>
                        <h3 className="section-label mb-2">Between now and dinner</h3>
                        <ul className="space-y-2">
                          {plan.timeline.map((row) => (
                            <li
                              key={`${row.label}-${row.step}`}
                              className="flex gap-3 rounded-xl bg-white/80 px-3 py-2.5 text-sm"
                            >
                              {row.label ? (
                                <span className="shrink-0 font-mono text-xs font-semibold text-primary-900">
                                  {row.label}
                                </span>
                              ) : null}
                              <span className="text-[#5C6478]">{row.step}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    <section>
                      <h3 className="section-label mb-2">At the stove</h3>
                      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-[#5C6478]">
                        {plan.cookSteps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </section>

                    {plan.shoppingSuggestions.length > 0 ? (
                      <section>
                        <h3 className="section-label mb-2 flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Still need from the store
                        </h3>
                        <ul className="space-y-2">
                          {plan.shoppingSuggestions.map((item, i) => (
                            <li key={item}>
                              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedShop.has(i)}
                                  onChange={() => toggleShop(i)}
                                  className="h-4 w-4 rounded border-[#D4CFC6]"
                                />
                                <span className="text-primary-900">{item}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {error ? (
                      <p className="text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              {!savedBanner ? (
                <footer className="shrink-0 border-t border-[#E7E2DA] bg-[#FAF7F2] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {!plan ? (
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={isPending}
                      className="btn-primary flex w-full items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Figuring out the order…
                        </>
                      ) : (
                        'Walk me through it'
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleApply(true)}
                        disabled={isPending}
                        className="btn-primary w-full"
                      >
                        {isPending ? 'Saving…' : 'Set for tonight & add to Lists'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(false)}
                        disabled={isPending || selectedShop.size === 0}
                        className="btn-secondary w-full text-sm"
                      >
                        Just add to Lists
                      </button>
                      <button
                        type="button"
                        onClick={resetPlan}
                        className="text-sm font-medium text-[#5C6478] hover:text-primary-900"
                      >
                        Start over
                      </button>
                    </div>
                  )}
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
