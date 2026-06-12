'use client'

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import type { DinnerHelperPlan } from '@/lib/dinner-helper-ai'
import {
  buildWalkSteps,
  phaseLabel,
  type CookWalkStep,
} from '@/lib/dinner-helper-format'

type DinnerWalkthroughProps = {
  plan: DinnerHelperPlan
  servingTime: string
  selectedShop: Set<number>
  onToggleShop: (index: number) => void
  onSave: () => void
  onSaveListsOnly: () => void
  onStartOver: () => void
  isPending: boolean
}

export function DinnerWalkthrough({
  plan,
  servingTime,
  selectedShop,
  onToggleShop,
  onSave,
  onSaveListsOnly,
  onStartOver,
  isPending,
}: DinnerWalkthroughProps) {
  const steps = buildWalkSteps(plan)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [showShopping, setShowShopping] = useState(
    plan.shoppingSuggestions.length > 0
  )

  const current = steps[currentIndex]
  const isLast = currentIndex >= steps.length - 1

  const goNext = () => {
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3">
        <p className="font-serif text-xl font-medium text-primary-900 md:text-2xl">
          {plan.mealTitle}
        </p>
        <p className="mt-0.5 text-sm text-[#5C6478]">Plates by {servingTime}</p>
      </div>

      {current ? (
        <div className="rounded-2xl border-2 border-primary-900/15 bg-white px-5 py-6 shadow-sm md:px-6 md:py-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-900 px-3 py-1 text-xs font-semibold text-white">
              Step {currentIndex + 1} of {steps.length}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">
              {phaseLabel(current.phase)}
            </span>
            {current.time ? (
              <span className="text-sm font-semibold tabular-nums text-[#5C6478]">
                {current.time}
              </span>
            ) : null}
          </div>
          <p className="font-serif text-2xl font-medium leading-snug text-primary-900 md:text-3xl md:leading-tight">
            {current.text}
          </p>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0}
          className="touch-tablet flex flex-1 items-center justify-center gap-1 rounded-full border border-[#E7E2DA] bg-white py-3 text-sm font-semibold text-primary-900 transition-smooth hover:border-[#D4CFC6] disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={goNext}
            className="touch-tablet btn-primary flex flex-[2] items-center justify-center gap-1 py-3 text-base"
          >
            Next step
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="touch-tablet btn-primary flex flex-[2] items-center justify-center py-3 text-base"
          >
            {isPending ? 'Saving…' : 'Set for tonight & add to Lists'}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E7E2DA]/80 bg-white/60">
        <button
          type="button"
          onClick={() => setShowAllSteps((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-primary-900"
        >
          All steps
          <ChevronDown
            className={`h-4 w-4 text-[#5C6478] transition-transform ${showAllSteps ? 'rotate-180' : ''}`}
          />
        </button>
        {showAllSteps ? (
          <ul className="border-t border-[#E7E2DA]/80 px-2 py-2">
            {steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                index={i}
                isCurrent={i === currentIndex}
                isDone={i < currentIndex}
                onSelect={() => setCurrentIndex(i)}
              />
            ))}
          </ul>
        ) : null}
      </div>

      {plan.shoppingSuggestions.length > 0 ? (
        <div className="rounded-xl border border-[#E7E2DA]/80 bg-white/60">
          <button
            type="button"
            onClick={() => setShowShopping((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-primary-900"
          >
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4" />
              Still need from the store
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#5C6478] transition-transform ${showShopping ? 'rotate-180' : ''}`}
            />
          </button>
          {showShopping ? (
            <ul className="space-y-2 border-t border-[#E7E2DA]/80 px-3 py-3">
              {plan.shoppingSuggestions.map((item, i) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E2DA] bg-white px-4 py-3 text-base">
                    <input
                      type="checkbox"
                      checked={selectedShop.has(i)}
                      onChange={() => onToggleShop(i)}
                      className="h-5 w-5 rounded border-[#D4CFC6]"
                    />
                    <span className="text-primary-900">{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {isLast ? (
        <div className="flex flex-col gap-2 border-t border-[#E7E2DA]/80 pt-3">
          {selectedShop.size > 0 ? (
            <button
              type="button"
              onClick={onSaveListsOnly}
              disabled={isPending}
              className="btn-secondary w-full text-sm"
            >
              Just add to Lists
            </button>
          ) : null}
          <button
            type="button"
            onClick={onStartOver}
            className="text-sm font-medium text-[#5C6478] hover:text-primary-900"
          >
            Start over
          </button>
        </div>
      ) : null}
    </div>
  )
}

function StepRow({
  step,
  index,
  isCurrent,
  isDone,
  onSelect,
}: {
  step: CookWalkStep
  index: number
  isCurrent: boolean
  isDone: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-smooth ${
          isCurrent
            ? 'bg-amber-50 ring-1 ring-amber-200'
            : isDone
              ? 'opacity-60'
              : 'hover:bg-white'
        }`}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isCurrent
              ? 'bg-primary-900 text-white'
              : isDone
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-[#F0EBE3] text-[#5C6478]'
          }`}
        >
          {isDone ? '✓' : index + 1}
        </span>
        <span className="min-w-0 flex-1">
          {step.time ? (
            <span className="block text-xs font-semibold tabular-nums text-[#5C6478]">
              {step.time}
            </span>
          ) : null}
          <span
            className={`block leading-snug ${
              isCurrent ? 'text-base font-medium text-primary-900' : 'text-sm text-[#5C6478]'
            }`}
          >
            {step.text}
          </span>
        </span>
      </button>
    </li>
  )
}
