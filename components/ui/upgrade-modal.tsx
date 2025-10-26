'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { PremiumButton } from './premium-button'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  currentUsage?: number
  limit?: number
}

export function UpgradeModal({ isOpen, onClose, feature, currentUsage, limit }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-medium text-gray-900">
              Upgrade to Pro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Feature-specific message */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {feature}
            </h3>
            {currentUsage !== undefined && limit !== undefined && (
              <p className="text-sm text-gray-600 mb-4">
                You've used {currentUsage} of {limit} {feature.toLowerCase()}.
              </p>
            )}
            <p className="text-gray-700">
              Upgrade to <span className="font-semibold text-blue-600">Pro</span> to unlock unlimited {feature.toLowerCase()} and all premium features.
            </p>
          </div>

          {/* Pro Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-900 mb-3">Pro includes:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited legacy notes
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Voice recordings
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Family sharing
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link
              href="/upgrade"
              className="block"
            >
              <PremiumButton
                size="lg"
                className="w-full"
              >
                Upgrade to Pro - $9.99/month
              </PremiumButton>
            </Link>
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
