'use client'

import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  plan?: string
}

/**
 * 🧭 Simple Navigation - Meta/Instagram Style
 * Bottom tab bar on mobile, centered logo on desktop
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
    <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
        <p className="text-xs text-gray-500">
          {profile?.plan === 'pro' || profile?.plan === 'lifetime' ? 'Pro Member' : 'Free Member'}
        </p>
      </div>
      
      <div className="py-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => setIsDropdownOpen(false)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Subscription Management
        </Link>
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
      {/* Spacer for top offset */}
      <div className="h-4 md:h-6"></div>
      
      {/* MOBILE: Top bar with logo + user menu */}
      <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Compact Logo on Left */}
            <Link href="/dashboard" className="group flex-shrink-0">
              <div className="px-3 py-1 rounded-lg bg-gradient-to-br from-slate-900 to-gray-800 shadow-sm group-hover:shadow-md transition-all duration-200">
                <h1 className="text-base font-serif font-light text-white tracking-tight whitespace-nowrap">
                  For One Day
                </h1>
              </div>
            </Link>
            
            {/* User Menu on Right */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">
                    {(profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {isDropdownOpen && <DropdownMenu />}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE: Bottom Tab Bar - Meta/Instagram Style */}
      {/* Enhanced for Meta-level mobile UX: proper touch targets (min 44px), safe area support */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-2 pb-safe">
          <div className="flex items-center justify-around h-16 min-h-[64px]">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[44px] px-2 py-2 transition-colors active:bg-gray-50 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                  }`}
                  aria-label={item.name}
                >
                  <div className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* DESKTOP: Original centered logo design */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Equal left/right columns so the logo stays optically centered (Benji bar pattern) */}
          <div className="grid h-16 lg:h-[4.5rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
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
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3 ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                      {item.icon}
                    </span>
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Center: brand */}
            <Link href="/dashboard" className="group justify-self-center">
              <div className="rounded-lg bg-gradient-to-br from-slate-900 to-gray-800 px-4 py-1.5 shadow-md transition-all duration-200 group-hover:shadow-lg sm:px-5 sm:py-2">
                <span className="whitespace-nowrap font-serif text-lg font-light tracking-tight text-white sm:text-xl md:text-2xl">
                  For One Day
                </span>
              </div>
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
