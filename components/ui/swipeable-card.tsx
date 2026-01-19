'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeDelete?: () => void
  onSwipeAction?: () => void
  className?: string
  disabled?: boolean
}

/**
 * Swipeable Card Component
 * iOS/Android-style swipe to delete/action
 */
export function SwipeableCard({
  children,
  onSwipeDelete,
  onSwipeAction,
  className,
  disabled = false
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef<number>(0)
  const currentX = useRef<number>(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const SWIPE_THRESHOLD = 80
  const MAX_SWIPE = 120

  useEffect(() => {
    const card = cardRef.current
    if (!card || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      setIsSwiping(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return

      currentX.current = e.touches[0].clientX
      const deltaX = currentX.current - startX.current

      // Only allow left swipe (negative delta)
      if (deltaX < 0) {
        e.preventDefault()
        setSwipeOffset(Math.max(deltaX, -MAX_SWIPE))
      }
    }

    const handleTouchEnd = () => {
      if (!isSwiping) return

      if (swipeOffset <= -SWIPE_THRESHOLD) {
        // Trigger action
        if (onSwipeDelete) {
          onSwipeDelete()
        } else if (onSwipeAction) {
          onSwipeAction()
        }
        // Reset after action
        setTimeout(() => {
          setSwipeOffset(0)
        }, 300)
      } else {
        // Snap back
        setSwipeOffset(0)
      }

      setIsSwiping(false)
      startX.current = 0
      currentX.current = 0
    }

    card.addEventListener('touchstart', handleTouchStart, { passive: true })
    card.addEventListener('touchmove', handleTouchMove, { passive: false })
    card.addEventListener('touchend', handleTouchEnd)

    return () => {
      card.removeEventListener('touchstart', handleTouchStart)
      card.removeEventListener('touchmove', handleTouchMove)
      card.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isSwiping, swipeOffset, onSwipeDelete, onSwipeAction, disabled])

  return (
    <div className="relative overflow-hidden">
      {/* Delete Action Background */}
      {swipeOffset < -20 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-6 bg-red-500 z-0"
          style={{
            width: `${Math.abs(swipeOffset)}px`,
            transition: isSwiping ? 'none' : 'width 0.3s ease-out'
          }}
        >
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        className={cn(
          'relative z-10 bg-white transition-transform duration-200',
          className
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}
