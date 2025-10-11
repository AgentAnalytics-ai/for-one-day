'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

/**
 * 🧭 Dashboard navigation
 */
interface Profile {
  plan: string
  full_name?: string
}

export function DashboardNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Today', icon: '📅' },
    { href: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { href: '/table-talk', label: 'Table Talk', icon: '🎮' },
    { href: '/vault', label: 'Vault', icon: '🗂️' },
  ]

  return (
    <nav className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-serif font-bold text-gray-900">
              For One Day
            </span>
          </Link>

          {/* Nav items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {profile?.plan === 'free' && (
              <Link
                href="/upgrade"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Upgrade to Pro
              </Link>
            )}
            
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto pb-4 space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

