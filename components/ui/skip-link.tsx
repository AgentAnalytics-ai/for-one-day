'use client'

import Link from 'next/link'

/**
 * Skip Link Component
 * Accessibility: Allows keyboard users to skip to main content
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[max(1rem,env(safe-area-inset-top))] focus:z-50 focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
    >
      Skip to main content
    </Link>
  )
}
