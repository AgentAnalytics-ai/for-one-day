'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessCelebrationProps {
  message: string
  onComplete?: () => void
  duration?: number
}

/**
 * Success Celebration Component
 * Delightful success animations
 */
export function SuccessCelebration({
  message,
  onComplete,
  duration = 2000
}: SuccessCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onComplete?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm',
        'animate-in fade-in duration-300',
        !isVisible && 'animate-out fade-out duration-300'
      )}
    >
      <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-secondary-300 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-secondary-700" />
            </div>
            <div className="absolute inset-0 rounded-full bg-secondary-200 animate-ping opacity-20" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-secondary-600 animate-bounce" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">
            {message}
          </h3>
        </div>
      </div>
    </div>
  )
}
