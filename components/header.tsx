'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { NavPillLogo } from '@/components/brand/nav-pill-logo'
import { cn } from '@/lib/utils'

/**
 * Marketing + auth header — warm 2027 system; landing matches dashboard lockup.
 */
export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const isAuthPage = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/'
  const isDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/lists') ||
    pathname?.startsWith('/week') ||
    pathname?.startsWith('/more') ||
    pathname?.startsWith('/vault') ||
    pathname?.startsWith('/reflection') ||
    pathname?.startsWith('/memories') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/upgrade')
  const isLegalPage = pathname === '/terms' || pathname === '/privacy'

  useEffect(() => {
    if (!isLandingPage) return
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLandingPage])

  const headerClass = cn(
    'sticky top-0 z-50 safe-area-inset-top safe-area-x transition-all duration-300',
    isLandingPage
      ? scrolled
        ? 'border-b border-[#E7E2DA]/80 bg-[#FAF7F2]/95 shadow-[0_4px_24px_rgba(16,42,67,0.04)] backdrop-blur-md'
        : 'border-b border-transparent bg-transparent'
      : 'border-b border-[#E7E2DA] bg-white/95 shadow-sm backdrop-blur-md'
  )

  const navLinkClass =
    'text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900 rounded-lg px-3 py-2 hover:bg-[#F3EDE4]/60'

  return (
    <header className={headerClass}>
      <div
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8',
          isLandingPage ? 'max-w-6xl' : 'max-w-7xl'
        )}
      >
        <div className="flex min-h-[4.25rem] items-center justify-between py-3 sm:min-h-[4.5rem]">
          <Link
            href={isDashboard ? '/dashboard' : '/'}
            className="group shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
          >
            {isDashboard ? (
              <div className="rounded-lg bg-primary-900 px-4 py-1.5 shadow-sm transition-shadow group-hover:shadow-md sm:px-5 sm:py-2">
                <BrandLogo
                  mark="horizon-a"
                  markClassName="h-6 w-6"
                  textClassName="font-serif font-light text-white tracking-tight text-lg sm:text-xl"
                />
              </div>
            ) : (
              <NavPillLogo size="nav" />
            )}
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {isLandingPage ? (
              <>
                <Link href="#how" className={cn(navLinkClass, 'hidden sm:inline-flex')}>
                  How it works
                </Link>
                <Link href="#pricing" className={cn(navLinkClass, 'hidden md:inline-flex')}>
                  Plans
                </Link>
                <Link href="/auth/login" className={navLinkClass}>
                  Sign in
                </Link>
              </>
            ) : isAuthPage || isLegalPage ? (
              <Link href="/" className={navLinkClass}>
                <span className="hidden sm:inline">← </span>Home
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  )
}
