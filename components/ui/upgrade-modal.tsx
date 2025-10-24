/**
 * 💎 Beautiful Upgrade Modal
 * Professional upgrade experience instead of harsh error messages
 */

'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/billing-actions'
import { PremiumButton } from './premium-button'
import { PremiumCard } from './premium-card'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  currentCount: number
  limit: number
}

export function UpgradeModal({ isOpen, onClose, feature, currentCount, limit }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      console.log('Starting upgrade process...')
      const result = await createCheckoutSession()
      console.log('Upgrade result:', result)
      
      if (result?.success && result?.url) {
        console.log('Redirecting to Stripe checkout:', result.url)
        window.location.href = result.url
      } else if (result?.error) {
        console.error('Upgrade failed:', result.error)
        alert(`Upgrade failed: ${result.error}`)
        setIsLoading(false)
      } else {
        console.error('Unexpected upgrade result:', result)
        alert('Upgrade failed: Unexpected error occurred')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PremiumCard className="p-8 text-center relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            Unlock Unlimited {feature}
          </h2>

          {/* Current usage */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">You&apos;re currently using:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{currentCount}</span>
              <span className="text-gray-500">/</span>
              <span className="text-lg text-gray-400">{limit}</span>
              <span className="text-sm text-gray-600">{feature.toLowerCase()}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="text-left mb-6">
            <h3 className="font-medium text-gray-900 mb-3">With For One Day Pro, you get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited {feature}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Family sharing features
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">$9.99</div>
              <div className="text-sm text-gray-600">per month</div>
              <div className="text-xs text-gray-500 mt-1">Cancel anytime</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <PremiumButton
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro - $9.99/month
                </>
              )}
            </PremiumButton>
            
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z" />
                </svg>
                Secure payment
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}
