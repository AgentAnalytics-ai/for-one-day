'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Images, Lock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Legacy component — not mounted in `app/(dashboard)/layout.tsx`.
 * Dashboard uses `SimpleNav`’s bottom tabs only. Do not add this to the layout alongside SimpleNav
 * (duplicate nav + mismatched “Today” icon). Kept for reference or one-off experiments.
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
      href: '/memories',
      label: 'Memories',
      icon: Images,
      active: pathname === '/memories' || pathname?.startsWith('/memories/')
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-xl backdrop-blur safe-area-inset-bottom md:hidden">
        <div className="grid grid-cols-4 h-16">
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
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 transition-transform duration-200',
                  item.active && 'scale-110'
                )} />
                <span className={cn(
                  'text-xs font-semibold transition-all duration-200',
                  item.active ? 'text-slate-900' : 'text-slate-500'
                )}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-900 rounded-b-full" />
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
