'use client'

import { cn } from '@/lib/utils'

export type SettingsTabId = 'household' | 'profile' | 'billing' | 'account'

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'household', label: 'Household' },
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Plan' },
  { id: 'account', label: 'Account' },
]

export function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTabId
  onChange: (id: SettingsTabId) => void
}) {
  return (
    <nav
      className="mb-6 flex gap-0.5 overflow-x-auto rounded-2xl border border-[#E7E2DA] bg-[#FAF7F2]/90 p-1 scrollbar-hide"
      aria-label="Family settings"
      role="tablist"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'min-w-[4.5rem] flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
              isActive
                ? 'bg-primary-900 text-white shadow-sm'
                : 'text-[#5C6478] hover:bg-white/80 hover:text-primary-900'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export function settingsTabFromHash(hash: string): SettingsTabId {
  const id = hash.replace('#', '')
  if (id === 'more') return 'household'
  if (TABS.some((t) => t.id === id)) return id as SettingsTabId
  return 'household'
}
