'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { createCheckoutSession, createPortalSession } from '@/app/actions/billing-actions'
import { toast } from '@/lib/toast'
import { ToastContainer } from '@/components/ui/toast'

export default function UpgradePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'lifetime'>('free')
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('success')) {
      toast.success('Success!', 'Your subscription is now active!')
      urlParams.delete('success')
      window.history.replaceState({}, document.title, window.location.pathname + urlParams.toString())
    }
    if (urlParams.has('canceled')) {
      toast.info('Canceled', 'Your checkout was canceled.')
      urlParams.delete('canceled')
      window.history.replaceState({}, document.title, window.location.pathname + urlParams.toString())
    }
    if (urlParams.has('error')) {
      toast.error('Error', decodeURIComponent(urlParams.get('error') || 'An unknown error occurred.'))
      urlParams.delete('error')
      window.history.replaceState({}, document.title, window.location.pathname + urlParams.toString())
    }
  }, [])

  useEffect(() => {
    async function getUserAndPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('user_id', user.id)
          .single()

        let profile = profileData

        // If profile doesn't exist, create one
        if (error && error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile')
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              plan: 'free',
              full_name: user.email?.split('@')[0] || 'User'
            })
            .select('plan')
            .single()

          if (newProfile) {
            profile = newProfile
          } else if (createError) {
            console.error('Error creating profile:', createError)
          }
        } else if (error) {
          console.error('Error fetching profile:', error)
        }

        if (profile) {
          setCurrentPlan(profile.plan as 'free' | 'pro' | 'lifetime')
        }
      }
      setLoading(false)
    }
    getUserAndPlan()
  }, [])

  useEffect(() => {
    // Set up toast subscription
    const unsubscribe = toast.subscribe(setToasts)
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading upgrade options...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 flex items-center justify-center">
        <PremiumCard className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to view upgrade options.</p>
          <Link href="/auth/login">
            <PremiumButton>Sign In</PremiumButton>
          </Link>
        </PremiumCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50">
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Logo */}
        <div className="text-center mb-8">
          <Image
            src="/ForOneDay_HeroLockup.png"
            alt="For One Day"
            width={300}
            height={90}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-4xl font-serif font-light text-gray-900">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-gray-600 mt-2">Unlock unlimited legacy notes and family connections.</p>
        </div>

        <div className="flex justify-center mb-8">
          <SubscriptionBadge tier={currentPlan} className="text-lg px-5 py-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <PremiumCard className="p-8 border-2 border-green-200 shadow-lg">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Free</h2>
            <p className="text-5xl font-bold text-gray-900 mb-6">$0<span className="text-xl font-medium text-gray-600">/month</span></p>
            <ul className="space-y-3 text-gray-700 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3 Legacy Notes</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10 Family Connections</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited Daily Reflections</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Basic Support</span>
              </li>
            </ul>
            <PremiumButton variant="secondary" className="w-full" disabled>
              Current Plan
            </PremiumButton>
          </PremiumCard>

          {/* Pro Plan Card */}
          <PremiumCard className="p-8 border-2 border-blue-200 shadow-lg relative">
            <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
            <h2 className="text-3xl font-serif font-bold text-blue-900 mb-4">Pro</h2>
            <p className="text-5xl font-bold text-blue-900 mb-6">$9.99<span className="text-xl font-medium text-gray-600">/month</span></p>
            <ul className="space-y-3 text-gray-700 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited Legacy Notes</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited Family Connections</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Family Sharing Features</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Advanced Analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority Support</span>
              </li>
            </ul>
            {currentPlan === 'free' ? (
              <PremiumButton 
                onClick={async () => {
                  try {
                    const result = await createCheckoutSession()
                    if (result?.success && result?.url) {
                      window.location.href = result.url
                    } else if (result?.error) {
                      console.error('Upgrade failed:', result.error)
                      toast.error('Upgrade Failed', result.error)
                    }
                  } catch (error) {
                    console.error('Upgrade failed:', error)
                    toast.error('Upgrade Failed', 'An unexpected error occurred')
                  }
                }}
                className="w-full"
              >
                Upgrade to Pro - $9.99/month
              </PremiumButton>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-green-600 font-medium">✓ Active Pro Plan</div>
                <PremiumButton 
                  onClick={async () => {
                    try {
                      const result = await createPortalSession()
                      if (result?.success && result?.url) {
                        window.location.href = result.url
                      } else if (result?.error) {
                        console.error('Portal failed:', result.error)
                        toast.error('Portal Failed', result.error)
                      }
                    } catch (error) {
                      console.error('Portal failed:', error)
                      toast.error('Portal Failed', 'An unexpected error occurred')
                    }
                  }}
                  variant="secondary" 
                  className="w-full"
                >
                  Manage Subscription
                </PremiumButton>
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Success Message */}
        <PremiumCard className="p-8 text-center bg-gradient-to-r from-green-50 to-blue-50 mt-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
            Secure Payment Processing Active
          </h3>
          <p className="text-gray-600 mb-6">
            Your subscription is powered by Stripe, the industry standard for secure payments. All transactions are encrypted and PCI compliant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <PremiumButton variant="secondary">
                Back to Dashboard
              </PremiumButton>
            </Link>
            <Link href="/vault">
              <PremiumButton>
                Start Creating Legacy Notes
              </PremiumButton>
            </Link>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}