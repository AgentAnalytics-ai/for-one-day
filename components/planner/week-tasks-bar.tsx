import Link from 'next/link'
import { ListTodo, ShoppingBag } from 'lucide-react'
import type { TodayListGlance } from '@/app/actions/list-actions'
import { cn } from '@/lib/utils'

type WeekTasksBarProps = {
  glance: TodayListGlance | null
}

/**
 * Glance-only counts — open Lists to check off (no faux drill-down body).
 */
export function WeekTasksBar({ glance }: WeekTasksBarProps) {
  if (!glance?.success) return null

  const { canEdit, shopping, todo } = glance
  const groceryCount = shopping.openCount
  const todoCount = todo.openCount

  return (
    <div
      className="week-tasks-bar flex flex-wrap items-center gap-2 rounded-xl border border-[#E7E2DA]/90 bg-[#FAF7F2]/50 px-3 py-2 sm:gap-2.5 sm:px-3.5"
      aria-label="Household lists at a glance"
    >
      <Link
        href="/lists#groceries"
        className={cn(
          'touch-tablet inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          groceryCount > 0
            ? 'border-amber-200/90 bg-amber-50/90 text-amber-950 hover:bg-amber-100/90'
            : 'border-[#E7E2DA] bg-white text-[#5C6478] hover:border-[#D4CFC6]'
        )}
      >
        <ShoppingBag className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        {groceryCount > 0 ? `${groceryCount} groceries` : 'Groceries'}
      </Link>

      <Link
        href="/lists#todo"
        className={cn(
          'touch-tablet inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          todoCount > 0
            ? 'border-primary-200/90 bg-primary-50/90 text-primary-900 hover:bg-primary-100/80'
            : 'border-[#E7E2DA] bg-white text-[#5C6478] hover:border-[#D4CFC6]'
        )}
      >
        <ListTodo className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        {todoCount > 0 ? `${todoCount} to-dos` : 'To-dos'}
      </Link>

      <Link
        href="/lists"
        className="ml-auto text-xs font-medium text-[#5C6478] hover:text-primary-900 sm:pl-2"
      >
        Open lists →
      </Link>

      {!canEdit ? (
        <span className="w-full text-[10px] text-[#5C6478] sm:w-auto sm:ml-0">
          Pro unlocks shared lists
        </span>
      ) : null}
    </div>
  )
}
