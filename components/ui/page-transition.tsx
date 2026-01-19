'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * Page Transition Wrapper
 * Smooth page transitions for better UX
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={cn(
        'transition-opacity duration-300',
        isTransitioning ? 'opacity-0' : 'opacity-100'
      )}
    >
      {children}
    </div>
  )
}
