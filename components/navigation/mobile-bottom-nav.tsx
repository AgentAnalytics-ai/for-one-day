'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Lock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Mobile Bottom Navigation
 * iOS/Android-style bottom navigation for mobile devices
 */
export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Today',
      icon: Home,
      active: pathname === '/dashboard' || pathname === '/'
    },
    {
      href: '/vault',
      label: 'Vault',
      icon: Lock,
      active: pathname === '/vault' || pathname?.startsWith('/vault')
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname === '/settings' || pathname?.startsWith('/settings')
    }
  ]

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-100 shadow-2xl safe-area-inset-bottom md:hidden">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Navigate to ${item.label}`}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-all duration-200',
                  item.active
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50/50'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 transition-transform duration-200',
                  item.active && 'scale-110'
                )} />
                <span className={cn(
                  'text-xs font-semibold transition-all duration-200',
                  item.active ? 'text-primary-700' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-700 rounded-b-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  )
}
