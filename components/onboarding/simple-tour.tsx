'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'vault',
    title: 'Your Legacy Vault',
    description: 'Store letters, videos, and important documents here. Everything is secure and private.',
    target: '[data-tour="vault"]'
  },
  {
    id: 'create',
    title: 'Create Your First Letter',
    description: 'Click here to write your first legacy letter. Choose from templates or write your own.',
    target: '[data-tour="create"]'
  }
]

export function SimpleTour() {
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  useEffect(() => {
    if (currentStep !== null) {
      // Scroll to target element when step changes
      const step = TOUR_STEPS[currentStep]
      const targetElement = document.querySelector(step.target)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentStep])

  const checkOnboardingStatus = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    if (data && !data.onboarding_completed) {
      // Start tour after a brief delay to let page render
      setTimeout(() => {
        const firstStep = TOUR_STEPS[0]
        const targetElement = document.querySelector(firstStep.target)
        if (targetElement) {
          setCurrentStep(0)
        }
      }, 1500)
    } else {
      setCompleted(true)
    }
  }

  const nextStep = () => {
    if (currentStep === null) return
    
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const completeTour = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id)

    setCurrentStep(null)
    setCompleted(true)
  }

  if (completed || currentStep === null) return null

  const step = TOUR_STEPS[currentStep]
  const targetElement = document.querySelector(step.target)

  if (!targetElement) {
    // If target not found, skip to next or complete
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
    return null
  }

  const rect = targetElement.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={skipTour}
      />
      
      {/* Highlight box */}
      <div
        className="fixed z-50 border-4 border-blue-500 rounded-lg pointer-events-none transition-all"
        style={{
          left: `${rect.left + scrollX - 4}px`,
          top: `${rect.top + scrollY - 4}px`,
          width: `${rect.width + 8}px`,
          height: `${rect.height + 8}px`,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl p-6 max-w-sm"
        style={{
          left: `${rect.left + scrollX + rect.width / 2}px`,
          top: `${rect.top + scrollY + rect.height + 16}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1 mt-4 justify-center">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= currentStep ? 'bg-blue-600 w-6' : 'bg-gray-300 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}

