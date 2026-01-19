'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

/**
 * Pull-to-Refresh Component
 * Mobile-native pull-to-refresh experience
 */
export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const PULL_THRESHOLD = 80
  const MAX_PULL = 120

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)
      
      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance, MAX_PULL))
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true)
        await onRefresh()
        setIsRefreshing(false)
      }

      setIsPulling(false)
      setPullDistance(0)
      startY.current = 0
      currentY.current = 0
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh])

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const shouldTrigger = pullDistance >= PULL_THRESHOLD

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull Indicator */}
      {isPulling && pullDistance > 10 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-4 safe-area-inset-top pointer-events-none">
          <div
            className={cn(
              'flex flex-col items-center gap-2 transition-all duration-200',
              shouldTrigger ? 'scale-110' : 'scale-100'
            )}
            style={{
              opacity: Math.min(pullProgress * 2, 1)
            }}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-lg',
                isRefreshing && 'animate-spin'
              )}
            >
              <RefreshCw
                className={cn(
                  'w-5 h-5 text-white transition-transform duration-200',
                  shouldTrigger && 'rotate-180'
                )}
              />
            </div>
            <p className="text-sm font-semibold text-primary-700">
              {shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
            </p>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
