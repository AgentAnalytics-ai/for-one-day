'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
}

/**
 * Skeleton Loading Component
 * Beautiful animated loading placeholders
 */
export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer'
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  }

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={style}
    />
  )
}

/**
 * Card Skeleton - For loading cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 shadow-lg">
      <Skeleton variant="text" width="60%" height={24} className="mb-4" />
      <Skeleton variant="text" width="100%" height={16} className="mb-2" />
      <Skeleton variant="text" width="80%" height={16} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  )
}

/**
 * Stats Skeleton - For loading stats
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-primary-200">
          <Skeleton variant="text" width="60%" height={12} className="mb-2" />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>
  )
}

/**
 * Progress Skeleton - For loading progress bars
 */
export function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="rectangular" width="100%" height={20} className="rounded-full" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={60} className="rounded-lg" />
        ))}
      </div>
    </div>
  )
}
