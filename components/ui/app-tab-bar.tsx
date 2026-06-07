'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type AppTabItem = {
  name: string
  href: string
  icon: React.ReactNode
  isActive: boolean
}

type AppTabBarProps = {
  items: AppTabItem[]
  variant: 'bottom' | 'inline'
  className?: string
}

/**
 * Unified tab bar — one surface, smooth pill transitions (2027).
 */
export function AppTabBar({ items, variant, className }: AppTabBarProps) {
  const isBottom = variant === 'bottom'

  return (
    <div
      className={cn(
        'flex items-stretch gap-0.5 rounded-2xl border border-[#E7E2DA] bg-[#FAF7F2]/90 p-1 shadow-[0_4px_24px_rgba(16,42,67,0.08)] backdrop-blur-md',
        isBottom ? 'w-full' : 'inline-flex',
        className
      )}
      role="tablist"
    >
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          role="tab"
          aria-selected={item.isActive}
          aria-current={item.isActive ? 'page' : undefined}
          className={cn(
            'relative flex flex-1 flex-col items-center justify-center rounded-xl transition-all duration-300 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
            isBottom ? 'min-h-[52px] px-1 py-1.5' : 'min-h-[44px] gap-1 px-3.5 py-2 sm:flex-row sm:gap-2',
            item.isActive
              ? 'bg-primary-900 text-white shadow-sm'
              : 'text-[#5C6478] hover:bg-white/80 hover:text-primary-900 active:scale-[0.98]'
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center transition-transform duration-300',
              isBottom ? '[&>svg]:h-[20px] [&>svg]:w-[20px]' : '[&>svg]:h-5 [&>svg]:w-5',
              item.isActive && 'scale-105'
            )}
          >
            {item.icon}
          </span>
          <span
            className={cn(
              'font-semibold tracking-tight',
              isBottom ? 'mt-0.5 max-w-[4.25rem] truncate text-[10px] leading-tight' : 'text-sm'
            )}
          >
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
