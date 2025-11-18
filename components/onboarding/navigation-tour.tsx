'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  href?: string // Optional: navigate to this page
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'today',
    title: 'Today',
    description: 'Start here each day. See your daily verse and reflection prompt.',
    target: 'a[href="/dashboard"]',
    href: '/dashboard'
  },
  {
    id: 'reflection',
    title: 'Reflection',
    description: 'Write your daily journal entry. Document your thoughts and prayers.',
    target: 'a[href="/reflection"]',
    href: '/reflection'
  },
  {
    id: 'vault',
    title: 'Vault',
    description: 'Store legacy letters, videos, and important documents for your family.',
    target: 'a[href="/vault"]',
    href: '/vault'
  },
  {
    id: 'settings-email',
    title: 'Create Email Accounts',
    description: 'Go to Settings to create email accounts for your children. This lets you send them messages in the future.',
    target: 'a[href="/settings"]',
    href: '/settings'
  }
]

export function NavigationTour() {
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    checkOnboardingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentStep !== null && !isLoading) {
      updatePosition()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isLoading, pathname])

  useEffect(() => {
    if (currentStep !== null) {
      const handleUpdate = () => updatePosition()
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== null) {
        completeTour()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const checkOnboardingStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (data?.onboarding_completed === true) {
        setCompleted(true)
        return
      }

      // Start tour on dashboard
      // Only show tour on dashboard (first page) - not on other pages
      const pathname = window.location.pathname
      if ((!data || data.onboarding_completed === false || data.onboarding_completed === null) && pathname === '/dashboard') {
        setTimeout(() => {
          const firstStep = TOUR_STEPS[0]
          const targetElement = document.querySelector(firstStep.target)
          if (targetElement) {
            setCurrentStep(0)
          } else {
            // If target not found, mark as completed to prevent retries
            setCurrentStep(null)
            setCompleted(true)
            markTourCompleted()
          }
        }, 3000) // Longer delay to let user see the page first
      }
    } catch (error) {
      console.error('Error checking onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePosition = useCallback(() => {
    if (currentStep === null) return

    const step = TOUR_STEPS[currentStep]
    const targetElement = document.querySelector(step.target)
    
    if (!targetElement) {
      // If target not found, try next step
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        completeTour()
      }
      return
    }

    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    })
  }, [currentStep])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextStep = () => {
    if (currentStep === null) return
    
    const step = TOUR_STEPS[currentStep]
    
    // If step has a href and we're not on that page, navigate there
    if (step.href && step.href !== pathname) {
      router.push(step.href)
      // Wait a moment for navigation, then continue to next step
      setTimeout(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          completeTour()
        }
      }, 800)
    } else {
      // Just go to next step
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        completeTour()
      }
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const markTourCompleted = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error marking tour completed:', error)
    }
  }

  const completeTour = async () => {
    setCurrentStep(null)
    setCompleted(true)
    await markTourCompleted()
  }

  if (completed || isLoading || currentStep === null) return null

  const step = TOUR_STEPS[currentStep]
  const targetElement = document.querySelector(step.target)

  if (!targetElement) {
    if (currentStep < TOUR_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 100)
    } else {
      completeTour()
    }
    return null
  }

  const rect = targetElement.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX

  // Calculate tooltip position (mobile-optimized)
  const getTooltipPosition = () => {
    const spacing = 20
    const isMobile = window.innerWidth < 640
    const tooltipWidth = isMobile ? window.innerWidth - 32 : 360
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Default: below the target
    let top = rect.bottom + scrollY + spacing
    let left = rect.left + scrollX + rect.width / 2

    // Mobile: center horizontally, position below
    if (isMobile) {
      left = viewportWidth / 2
      // If not enough space below, position above
      if (rect.bottom + spacing + 250 > viewportHeight) {
        top = rect.top + scrollY - 250 - spacing
      }
    } else {
      // Desktop: adjust for viewport boundaries
      if (left < tooltipWidth / 2) {
        left = tooltipWidth / 2 + 20
      } else if (left > viewportWidth - tooltipWidth / 2) {
        left = viewportWidth - tooltipWidth / 2 - 20
      }
      // If not enough space below, position above
      if (rect.bottom + spacing + 250 > viewportHeight + scrollY) {
        top = rect.top + scrollY - 250 - spacing
      }
    }

    return { top, left, isMobile }
  }

  const { top, left, isMobile } = getTooltipPosition()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={skipTour}
      />

      {/* Highlight */}
      <div
        className="fixed z-[9999] pointer-events-none transition-all duration-300"
        style={{
          left: `${rect.left + scrollX - 8}px`,
          top: `${rect.top + scrollY - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(59, 130, 246, 1), 0 0 20px rgba(59, 130, 246, 0.5)',
          borderRadius: '12px',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-white rounded-2xl shadow-2xl pointer-events-auto"
        style={{
          top: `${top}px`,
          left: isMobile ? '1rem' : `${left}px`,
          right: isMobile ? '1rem' : 'auto',
          width: isMobile ? 'calc(100vw - 2rem)' : '360px',
          maxWidth: isMobile ? 'calc(100vw - 2rem)' : '360px',
          transform: isMobile ? 'none' : 'translateX(-50%)',
        }}
      >
        {/* Arrow - only show on desktop when positioned below */}
        {!isMobile && top > rect.bottom + scrollY && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white" />
        )}
        {!isMobile && top < rect.top + scrollY && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white" />
        )}

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {currentStep + 1}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 sm:mb-6">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={skipTour}
              className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 sm:py-1.5 text-center"
            >
              Skip
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-blue-600 w-8'
                    : i < currentStep
                    ? 'bg-blue-300 w-4'
                    : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

