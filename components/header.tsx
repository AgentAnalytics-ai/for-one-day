'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * 🎨 2026 Expert-Designed Header Component
 * Modern, centered brand with clean professional aesthetics
 * Follows latest UI/UX trends: larger typography, centered layout, minimal navigation
 */
export function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/'
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/vault') || pathname?.startsWith('/reflection') || pathname?.startsWith('/settings') || pathname?.startsWith('/upgrade')
  const isLegalPage = pathname === '/terms' || pathname === '/privacy'

  return (
    <header className="sticky top-0 z-50 bg-white/100 backdrop-blur-none border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 py-4 sm:py-5">
          {/* Left - Brand Name - Simplified for mobile */}
          <Link 
            href={isDashboard ? "/dashboard" : "/"} 
            className="group"
          >
            <div className={`relative rounded-lg bg-gradient-to-br from-slate-900 to-gray-800 shadow-md group-hover:shadow-lg transition-all duration-200 ${
              isDashboard ? 'px-4 sm:px-5 py-1.5 sm:py-2' : 'px-5 sm:px-6 py-2 sm:py-2.5'
            }`}>
              <h1 className={`font-serif font-light text-white tracking-tight ${
                isDashboard 
                  ? 'text-lg sm:text-xl md:text-2xl' 
                  : 'text-xl sm:text-2xl md:text-3xl'
              }`}>
                For One Day
              </h1>
            </div>
          </Link>

          {/* Right-side Navigation - Clean */}
          <nav className="flex items-center gap-3 sm:gap-4">
            {isLandingPage ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 sm:px-3 py-1.5 rounded-md hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Start Free
                </Link>
              </>
            ) : isAuthPage ? (
              <Link
                href="/"
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 sm:px-3 py-1.5 rounded-md hover:bg-gray-50"
              >
                <span className="hidden sm:inline">← </span>Home
              </Link>
            ) : isLegalPage ? (
              <Link
                href="/"
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 sm:px-3 py-1.5 rounded-md hover:bg-gray-50"
              >
                <span className="hidden sm:inline">← </span>Home
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  )
}

