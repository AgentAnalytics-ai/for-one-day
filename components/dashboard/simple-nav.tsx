'use client'

import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { NavPillLogo } from '@/components/brand/nav-pill-logo'
import { cn } from '@/lib/utils'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  plan?: string
}

/**
 * Primary app navigation.
 * Uses `lg` (not `md`) for the mobile/desktop split so tablets keep one pattern:
 * desktop header + bottom tabs on smaller screens — avoids a cramped “desktop” pill row on tablets.
 */
export function SimpleNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navItems = [
    {
      name: 'Today',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Vault',
      href: '/vault',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ]

  // Shared dropdown menu component
  const DropdownMenu = () => (
    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200/90 bg-white py-2 shadow-sm sm:w-64">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-medium text-slate-900">{profile?.full_name || 'User'}</p>
        <p className="text-xs text-slate-500">
          {profile?.plan === 'pro' || profile?.plan === 'lifetime' ? 'Pro member' : 'Free plan'}
        </p>
      </div>

      <div className="py-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
        
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Subscription
        </Link>
      </div>

      <div className="border-t border-slate-100 py-1">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: breathing room below global safe-area (mobile uses layout safe-area) */}
      <div className="hidden h-3 lg:block" aria-hidden />

      {/* MOBILE / TABLET: Single bottom tab bar */}
      <nav
        className="safe-area-x fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2 pt-1.5 pb-safe sm:max-w-xl">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-slate-50 text-primary-950'
                    : 'text-slate-500 active:bg-slate-50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive ? (
                  <span
                    className="absolute top-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-500"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    '[&>svg]:h-[22px] [&>svg]:w-[22px] transition-transform duration-200',
                    isActive ? 'text-primary-900' : 'text-slate-400'
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'max-w-[4.25rem] truncate text-[11px] font-semibold leading-tight tracking-tight',
                    isActive ? 'text-primary-950' : 'text-slate-500'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* DESKTOP: Centered wordmark nav */}
      <nav className="sticky top-0 z-50 hidden bg-transparent lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Equal left/right columns so the logo stays optically centered (Benji bar pattern) */}
          <div className="grid min-h-[5rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white px-3 py-2 lg:min-h-[5.25rem]">
            {/* Left: primary nav */}
            <div className="flex min-w-0 items-center justify-start gap-0.5 lg:gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border border-slate-200/90 bg-white text-primary-950 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {isActive ? (
                    <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500" />
                  ) : null}
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                    {item.icon}
                  </span>
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              )
            })}
            </div>

            {/* Center: brand */}
            <Link
              href="/dashboard"
              className="group justify-self-center rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <NavPillLogo />
            </Link>

            {/* Right: account */}
            <div className="relative flex min-w-0 justify-end" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 sm:gap-2.5 sm:px-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-medium text-slate-700">
                    {(profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-800 sm:inline">
                  {profile?.full_name || 'User'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && <DropdownMenu />}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
