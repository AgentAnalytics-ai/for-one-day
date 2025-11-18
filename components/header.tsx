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
    <header className="sticky top-0 sm:top-4 md:top-6 z-50 bg-white/98 backdrop-blur-md shadow-sm/50 border-b border-gray-100 sm:border-b-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 sm:h-20 relative">
          {/* Centered Brand Name - Responsive sizing */}
          <Link 
            href={isDashboard ? "/dashboard" : "/"} 
            className="absolute left-1/2 transform -translate-x-1/2 group"
          >
            <div className={`relative rounded-full bg-gradient-to-br from-slate-900 to-gray-800 border border-slate-700/50 shadow-lg group-hover:from-slate-800 group-hover:to-gray-700 group-hover:shadow-xl transition-all duration-300 ${
              isDashboard ? 'px-4 sm:px-6 py-1.5 sm:py-2' : 'px-5 sm:px-8 py-2 sm:py-3'
            }`}>
              <h1 className={`font-serif font-light text-white tracking-wide ${
                isDashboard 
                  ? 'text-xl sm:text-2xl md:text-3xl' 
                  : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
              }`}>
                For One Day
              </h1>
            </div>
          </Link>

          {/* Right-side Navigation - Minimal & Clean */}
          <nav className="ml-auto flex items-center gap-2 sm:gap-4">
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

