'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import {
  addListItem,
  deleteListItem,
  toggleListItem,
  type ListItem,
  type ListItemKind,
} from '@/app/actions/list-actions'

type SharedListSectionProps = {
  title: string
  kind: ListItemKind
  items: ListItem[]
  canEdit: boolean
  emptyMessage: string
  addLabel: string
}

export function SharedListSection({
  title,
  kind,
  items,
  canEdit,
  emptyMessage,
  addLabel,
}: SharedListSectionProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localItems, setLocalItems] = useState(items)
  const [composerOpen, setComposerOpen] = useState(items.length === 0 && canEdit)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const openItems = localItems.filter((i) => !i.done)
  const doneItems = localItems.filter((i) => i.done)

  const openComposer = () => {
    setComposerOpen(true)
    setError(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const closeComposer = () => {
    setComposerOpen(false)
    setDraft('')
    setError(null)
  }

  const handleAdd = () => {
    if (!canEdit || !draft.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addListItem(kind, draft)
      if (!result.success) {
        setError(result.error ?? 'Could not add item')
        return
      }
      if (result.item) {
        setLocalItems((prev) => [...prev, result.item!])
      }
      setDraft('')
      inputRef.current?.focus()
    })
  }

  const handleToggle = (id: string, done: boolean) => {
    if (!canEdit) return
    setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)))
    startTransition(async () => {
      const result = await toggleListItem(id, done)
      if (!result.success) {
        setLocalItems(items)
        setError(result.error ?? 'Could not update item')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!canEdit) return
    const previous = localItems
    setLocalItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(async () => {
      const result = await deleteListItem(id)
      if (!result.success) {
        setLocalItems(previous)
        setError(result.error ?? 'Could not remove item')
      }
    })
  }

  return (
    <section className="p-5 sm:p-6" aria-labelledby={`${inputId}-heading`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 id={`${inputId}-heading`} className="section-label">
            {title}
          </h2>
          {openItems.length > 0 ? (
            <span className="rounded-full bg-[#F3EDE4] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary-900">
              {openItems.length}
            </span>
          ) : null}
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={composerOpen ? closeComposer : openComposer}
            disabled={isPending}
            className="touch-tablet flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7E2DA] bg-white text-primary-900 shadow-sm transition-all hover:border-primary-300 hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 disabled:opacity-50"
            aria-label={composerOpen ? `Close ${title} add field` : `Add to ${title}`}
            aria-expanded={composerOpen}
            aria-controls={`${inputId}-composer`}
          >
            <Plus
              className={`h-5 w-5 transition-transform duration-200 ${composerOpen ? 'rotate-45' : ''}`}
              strokeWidth={2.25}
            />
          </button>
        ) : null}
      </div>

      {openItems.length === 0 && doneItems.length === 0 && !composerOpen ? (
        <button
          type="button"
          onClick={canEdit ? openComposer : undefined}
          disabled={!canEdit}
          className="mb-3 w-full rounded-2xl border border-dashed border-[#E7E2DA] bg-[#FAF7F2]/50 px-4 py-8 text-center transition-colors enabled:hover:border-primary-300 enabled:hover:bg-[#FAF7F2] disabled:cursor-default"
        >
          <p className="text-sm text-[#5C6478]">{emptyMessage}</p>
          {canEdit ? (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-900">
              <Plus className="h-4 w-4" aria-hidden />
              Tap to add
            </span>
          ) : null}
        </button>
      ) : (
        <ul className="mb-3 space-y-2">
          {openItems.map((item) => (
            <ListRow
              key={item.id}
              item={item}
              canEdit={canEdit}
              disabled={isPending}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {doneItems.length > 0 ? (
            <li className="pt-2">
              <p className="section-label mb-2 text-[10px]">Done</p>
              <ul className="space-y-2">
                {doneItems.map((item) => (
                  <ListRow
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    disabled={isPending}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </li>
          ) : null}
        </ul>
      )}

      {canEdit && composerOpen ? (
        <div
          id={`${inputId}-composer`}
          className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl border border-[#E7E2DA] bg-[#FAF7F2]/60 p-3"
        >
          <label htmlFor={inputId} className="sr-only">
            {addLabel}
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  closeComposer()
                }
              }}
              placeholder={addLabel}
              disabled={isPending}
              autoComplete="off"
              enterKeyHint="done"
              className="field-input min-h-[44px] flex-1 border-transparent bg-white py-3"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !draft.trim()}
              className="touch-tablet flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-900 text-white transition-colors hover:bg-primary-950 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Save item"
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}

      {canEdit && !composerOpen && localItems.length > 0 ? (
        <button
          type="button"
          onClick={openComposer}
          disabled={isPending}
          className="touch-tablet flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#E7E2DA] bg-transparent py-3 text-sm font-medium text-primary-900 transition-colors hover:border-primary-300 hover:bg-[#FAF7F2]/80 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add item
        </button>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function ListRow({
  item,
  canEdit,
  disabled,
  onToggle,
  onDelete,
}: {
  item: ListItem
  canEdit: boolean
  disabled: boolean
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-[#F0EBE3] bg-white px-3 py-3 shadow-sm shadow-[#102A43]/[0.03]">
      <input
        type="checkbox"
        checked={item.done}
        disabled={!canEdit || disabled}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="touch-tablet h-5 w-5 shrink-0 rounded-md border-[#D4CFC6] text-primary-800 focus:ring-primary-700 disabled:cursor-not-allowed"
        aria-label={`Mark ${item.title} as ${item.done ? 'not done' : 'done'}`}
      />
      <span
        className={`min-w-0 flex-1 text-[15px] leading-snug ${
          item.done ? 'text-[#5C6478] line-through' : 'text-primary-900'
        }`}
      >
        {item.title}
      </span>
      {canEdit ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(item.id)}
          className="touch-tablet flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C6478] opacity-70 transition-opacity hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 disabled:opacity-30"
          aria-label={`Remove ${item.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </li>
  )
}
