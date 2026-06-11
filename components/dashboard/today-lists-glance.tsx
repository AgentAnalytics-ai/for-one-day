import type { ReactNode } from 'react'
import Link from 'next/link'
import { ListTodo, ShoppingBag } from 'lucide-react'
import type { TodayListGlance } from '@/app/actions/list-actions'

type TodayListsGlanceProps = {
  glance: TodayListGlance
}

export function TodayListsGlance({ glance }: TodayListsGlanceProps) {
  const { canEdit, shopping, todo } = glance

  return (
    <Link
      href="/lists"
      className="surface-card kw-card-lists kitchen-wall--animate group block overflow-hidden transition-smooth hover:border-[#D4CFC6]"
    >
      <div className="border-b border-[#F0EBE3] px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">Lists</p>
          <span className="text-xs font-medium text-[#5C6478] transition-colors group-hover:text-primary-900">
            Open lists →
          </span>
        </div>
      </div>

      <div className="grid divide-y divide-[#F0EBE3] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <GlanceColumn
          icon={<ShoppingBag className="h-4 w-4 text-amber-800/80" strokeWidth={2} />}
          label="Shopping"
          count={shopping.openCount}
          previewTitles={shopping.previewTitles}
          emptyLabel={
            canEdit ? 'Add groceries for tonight' : 'Pro unlocks shared shopping'
          }
          accent="shopping"
        />
        <GlanceColumn
          icon={<ListTodo className="h-4 w-4 text-primary-800/80" strokeWidth={2} />}
          label="To do today"
          count={todo.openCount}
          previewTitles={todo.previewTitles}
          emptyLabel={canEdit ? 'Add a task for today' : 'Pro unlocks shared to-dos'}
          accent="todo"
        />
      </div>
    </Link>
  )
}

function GlanceColumn({
  icon,
  label,
  count,
  previewTitles,
  emptyLabel,
  accent,
}: {
  icon: ReactNode
  label: string
  count: number
  previewTitles: string[]
  emptyLabel: string
  accent: 'shopping' | 'todo'
}) {
  const hasItems = count > 0

  return (
    <div
      className={`px-5 py-4 sm:px-6 sm:py-5 ${
        accent === 'shopping' ? 'bg-gradient-to-br from-amber-50/40 to-transparent' : 'bg-gradient-to-br from-primary-50/30 to-transparent'
      }`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            accent === 'shopping' ? 'bg-amber-100/80' : 'bg-primary-100/70'
          }`}
        >
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#5C6478]">
          {label}
        </span>
        {hasItems ? (
          <span className="ml-auto rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary-900 shadow-sm">
            {count}
          </span>
        ) : null}
      </div>

      {hasItems ? (
        <div className="space-y-1.5">
          <p className="font-serif text-lg font-medium leading-snug text-primary-900 md:text-xl">
            {previewTitles[0]}
          </p>
          {previewTitles.length > 1 ? (
            <p className="text-sm leading-relaxed text-[#5C6478]">
              {previewTitles.slice(1).join(' · ')}
              {count > previewTitles.length ? (
                <span className="text-[#5C6478]/80">
                  {' '}
                  · +{count - previewTitles.length} more
                </span>
              ) : null}
            </p>
          ) : count > 1 ? (
            <p className="text-sm text-[#5C6478]">+{count - 1} more on the list</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-[#5C6478]">{emptyLabel}</p>
      )}
    </div>
  )
}
