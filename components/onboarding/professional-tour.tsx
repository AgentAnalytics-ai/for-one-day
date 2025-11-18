'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'vault',
    title: 'Your Legacy Vault',
    description: 'This is where you store letters, videos, and important documents. Everything is encrypted and secure.',
    target: '[data-tour="vault"]',
    position: 'bottom'
  },
  {
    id: 'create',
    title: 'Create Your First Letter',
    description: 'Click here to write your first legacy letter. Choose from professional templates or write your own.',
    target: '[data-tour="create"]',
    position: 'top'
  }
]

export function ProfessionalTour() {
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== null) {
        completeTour()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [currentStep])

  // Scroll and position when step changes
  useEffect(() => {
    if (currentStep !== null && !isLoading) {
      const timer = setTimeout(() => {
        updatePosition()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentStep, isLoading])

  // Update position on scroll/resize
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
  }, [currentStep])

  const checkOnboardingStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error)
        setIsLoading(false)
        return
      }

      // CRITICAL: Only show if onboarding_completed is explicitly FALSE or NULL
      // If it's TRUE, we never show the tour again
      if (data?.onboarding_completed === true) {
        setCompleted(true)
        return
      }

      // Only start tour if onboarding_completed is false/null AND user is on vault page
      if (!data || data.onboarding_completed === false || data.onboarding_completed === null) {
        // Wait for page to fully render
        setTimeout(() => {
          const firstStep = TOUR_STEPS[0]
          const targetElement = document.querySelector(firstStep.target)
          if (targetElement) {
            setCurrentStep(0)
          } else {
            // If target not found, mark as completed to prevent infinite retries
            console.warn('Tour target not found, marking as completed')
            // Mark as completed immediately
            setCurrentStep(null)
            setCompleted(true)
            // Try to update DB in background
            markTourCompleted()
          }
        }, 2000) // Give page time to render
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePosition = useCallback(() => {
    if (currentStep === null) return

    const step = TOUR_STEPS[currentStep]
    const targetElement = document.querySelector(step.target)
    
    if (!targetElement) {
      // Target not found, skip to next or complete
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        completeTour()
      }
      return
    }

    // Scroll element into view smoothly
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    })
  }, [currentStep])

  const nextStep = () => {
    if (currentStep === null) return
    
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStep === null || currentStep === 0) return
    setCurrentStep(currentStep - 1)
  }

  const skipTour = () => {
    completeTour()
  }

  // Helper to mark tour as completed in database
  const markTourCompleted = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // CRITICAL: Mark onboarding as completed in database
      // This ensures tour NEVER shows again for this user
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error marking tour as completed:', error)
    }
  }

  const completeTour = async () => {
    // Immediately hide tour UI
    setCurrentStep(null)
    setCompleted(true)
    
    // Mark as completed in database
    await markTourCompleted()
  }

  // Don't render if completed, loading, or no active step
  if (completed || isLoading || currentStep === null) return null

  const step = TOUR_STEPS[currentStep]
  const targetElement = document.querySelector(step.target)

  if (!targetElement) {
    // If target not found, try next step or complete
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

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const spacing = 20
    const tooltipWidth = 360
    const tooltipHeight = 200
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom'

    switch (step.position) {
      case 'top':
        top = rect.top + scrollY - tooltipHeight - spacing
        left = rect.left + scrollX + rect.width / 2
        arrowPosition = 'bottom'
        break
      case 'bottom':
      default:
        top = rect.bottom + scrollY + spacing
        left = rect.left + scrollX + rect.width / 2
        arrowPosition = 'top'
        break
    }

    // Adjust for viewport boundaries
    if (left < tooltipWidth / 2) {
      left = tooltipWidth / 2 + 20
    } else if (left > viewportWidth - tooltipWidth / 2) {
      left = viewportWidth - tooltipWidth / 2 - 20
    }

    if (top < 20) {
      top = rect.bottom + scrollY + spacing
      arrowPosition = 'top'
    } else if (top + tooltipHeight > viewportHeight + scrollY - 20) {
      top = rect.top + scrollY - tooltipHeight - spacing
      arrowPosition = 'bottom'
    }

    return { top, left, arrowPosition }
  }

  const { top, left, arrowPosition } = getTooltipPosition()

  return (
    <>
      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={skipTour}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Spotlight highlight */}
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

      {/* Professional tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white rounded-2xl shadow-2xl max-w-sm w-[360px] pointer-events-auto"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 ${
            arrowPosition === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white'
              : 'top-full left-1/2 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white'
          }`}
        />

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {step.title}
                </h3>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close tour"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'bg-blue-600 w-8'
                    : i < currentStep
                    ? 'bg-blue-300 w-4'
                    : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={skipTour}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={previousStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get started' : 'Next'}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

