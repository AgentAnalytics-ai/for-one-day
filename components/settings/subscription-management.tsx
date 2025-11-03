'use client'

import { useState, useEffect } from 'react'
import { createPortalSession, getUserSubscriptionStatus } from '@/app/actions/billing-actions'
import { createClient } from '@/lib/supabase/client'
import { StripePortalSetup } from './stripe-portal-setup'

interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'lifetime'
  status: string
  isActive: boolean
  endsAt: string | null
  trialEndsAt: string | null
  subscription?: {
    id: string
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
  } | null
}

/**
 * 💳 Subscription Management Component
 * Professional Stripe subscription management interface
 */
export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const status = await getUserSubscriptionStatus(user.id)
          setSubscription(status)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const [portalError, setPortalError] = useState<string | null>(null)

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const result = await createPortalSession()
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setPortalError(result.error || 'Failed to open subscription management')
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      setPortalError('Failed to open subscription management')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load subscription information</p>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Current Plan: {subscription.plan === 'pro' ? 'Pro' : subscription.plan === 'lifetime' ? 'Lifetime' : 'Free'}
            </h3>
            <p className="text-sm text-gray-600">
              {subscription.plan === 'free' 
                ? 'Limited to 3 legacy notes'
                : subscription.plan === 'pro'
                ? 'Unlimited legacy notes and features'
                : 'Lifetime access to all features'
              }
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscription.plan === 'pro' || subscription.plan === 'lifetime'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {subscription.plan === 'pro' || subscription.plan === 'lifetime' ? 'Active' : 'Free'}
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      {subscription.plan === 'pro' && subscription.subscription && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Subscription Details</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="capitalize">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Next billing date:</span>
              <span>{formatDate(subscription.endsAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>$9.99/month</span>
            </div>
          </div>
        </div>
      )}

      {/* Management Actions */}
      <div className="space-y-4">
        {subscription.plan === 'pro' || subscription.plan === 'lifetime' ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Manage Your Subscription</h4>
            <p className="text-sm text-gray-600 mb-4">
              Update your payment method, view billing history, or cancel your subscription.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Opening...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Subscription
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Upgrade to Pro</h4>
            <p className="text-sm text-gray-600 mb-4">
              Get unlimited legacy notes and access to all premium features.
            </p>
            <button
              onClick={() => window.location.href = '/upgrade'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>

      {/* Portal Error Display */}
      {portalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Subscription Management Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{portalError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Portal Setup Instructions */}
      {portalError && portalError.includes('configuration') && (
        <StripePortalSetup />
      )}

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600">
          If you have questions about your subscription or need assistance, please contact our support team.
        </p>
      </div>
    </div>
  )
}
