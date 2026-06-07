'use client'

import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect, useMemo } from 'react'
import { NavPillLogo } from '@/components/brand/nav-pill-logo'
import { HouseholdChrome } from '@/components/dashboard/household-chrome'
import { AppTabBar, type AppTabItem } from '@/components/ui/app-tab-bar'
import type { HouseholdSettings } from '@/app/actions/household-actions'
import { useWallMode } from '@/lib/use-wall-mode'
import { cn } from '@/lib/utils'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  plan?: string
}

const TODAY_ICON = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)
const LISTS_ICON = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)
const WEEK_ICON = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const MORE_ICON = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
)

function isMoreActive(pathname: string) {
  return (
    pathname.startsWith('/more') ||
    pathname.startsWith('/memories') ||
    pathname.startsWith('/vault')
  )
}

/**
 * Wall: Today · Lists · This week + gear (no More).
 * Phone: Today · Lists · This week · More.
 */
export function SimpleNav({
  profile,
  household,
}: {
  profile: Profile | null
  household: HouseholdSettings | null
}) {
  const pathname = usePathname() ?? ''
  const isWall = useWallMode()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const tabItems: AppTabItem[] = useMemo(() => {
    const daily: AppTabItem[] = [
      { name: 'Today', href: '/dashboard', icon: TODAY_ICON, isActive: pathname === '/dashboard' },
      { name: 'Lists', href: '/lists', icon: LISTS_ICON, isActive: pathname === '/lists' || pathname.startsWith('/lists/') },
      { name: 'This week', href: '/week', icon: WEEK_ICON, isActive: pathname === '/week' || pathname.startsWith('/week/') },
    ]
    if (!isWall) {
      daily.push({
        name: 'More',
        href: '/more',
        icon: MORE_ICON,
        isActive: isMoreActive(pathname),
      })
    }
    return daily
  }, [pathname, isWall])

  const GearButton = ({ className }: { className?: string }) => (
    <Link
      href="/settings#household"
      aria-label="Family settings"
      className={cn(
        'touch-tablet inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7E2DA] bg-white text-[#5C6478] shadow-sm transition-all duration-300 hover:border-[#D4CFC6] hover:text-primary-900 active:scale-95',
        pathname.startsWith('/settings') && 'border-primary-900/30 text-primary-900',
        className
      )}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </Link>
  )

  const DropdownMenu = () => (
    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[#E7E2DA] bg-white py-2 shadow-sm sm:w-64">
      <div className="border-b border-[#F0EBE3] px-4 py-3">
        <p className="text-sm font-medium text-primary-900">{profile?.full_name || 'User'}</p>
        <p className="truncate text-xs text-[#5C6478]">{household?.name ?? 'Your household'}</p>
      </div>
      <div className="py-1">
        {!isWall ? (
          <Link
            href="/more"
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#5C6478] hover:bg-[#F3EDE4]/50"
            onClick={() => setIsDropdownOpen(false)}
          >
            More — memories
          </Link>
        ) : null}
        <Link
          href="/settings#household"
          className="flex items-center gap-3 px-4 py-2 text-sm text-[#5C6478] hover:bg-[#F3EDE4]/50"
          onClick={() => setIsDropdownOpen(false)}
        >
          Family settings
        </Link>
      </div>
      <div className="border-t border-[#F0EBE3] py-1">
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#5C6478] hover:bg-[#F3EDE4]/50">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden h-3 lg:block" aria-hidden />

      {/* Phone / portrait: floating bottom tab bar */}
      <nav
        className="safe-area-x fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-center gap-2 sm:max-w-xl">
          <AppTabBar items={tabItems} variant="bottom" className="flex-1" />
          {isWall ? <GearButton /> : null}
        </div>
      </nav>

      {/* Desktop */}
      <nav className="sticky top-0 z-50 hidden bg-transparent lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-card grid min-h-[5rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 py-2.5">
            <AppTabBar items={tabItems} variant="inline" />

            <div className="nav-pill-logo flex flex-col items-center justify-self-center gap-1">
              <Link href="/dashboard" className="group rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2">
                <NavPillLogo />
              </Link>
              <HouseholdChrome household={household} variant="inline" />
            </div>

            <div className="relative flex min-w-0 items-center justify-end gap-2" ref={dropdownRef}>
              {isWall ? <GearButton /> : null}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex max-w-full items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-[#F3EDE4]/50 sm:px-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3EDE4]">
                  <span className="text-sm font-medium text-primary-900">
                    {(profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-primary-900 sm:inline">
                  {profile?.full_name || 'User'}
                </span>
              </button>
              {isDropdownOpen ? <DropdownMenu /> : null}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
