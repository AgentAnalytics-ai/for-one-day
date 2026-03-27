'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { CardSkeleton } from '@/components/ui/skeleton'
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="text-center">
              <div className="h-12 w-64 bg-gray-200 rounded-full animate-pulse mx-auto mb-4" />
              <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <PremiumCard className="p-8 text-center max-w-md">
          <h2 className="section-title mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to view upgrade options.</p>
          <Link href="/auth/login">
            <PremiumButton>Sign In</PremiumButton>
          </Link>
        </PremiumCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="page-eyebrow mb-4">
            <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-primary-900">Upgrade</span>
          </div>
          <h2 className="page-title mb-3">
            Upgrade to Pro
          </h2>
          <p className="page-subtitle max-w-2xl mx-auto">Unlock unlimited keepsakes, richer family organization, and Pro AI writing tools.</p>
        </div>

        <div className="flex justify-center mb-8">
          <SubscriptionBadge tier={currentPlan} className="text-lg px-5 py-2" />
        </div>
        <p className="text-center text-sm text-gray-600 mb-8">
          AI writing tools are included with Pro and Lifetime plans.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Plan Card */}
          <PremiumCard className="p-8 border-2 border-secondary-200 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Free</h2>
            <p className="text-5xl font-bold text-gray-900 mb-6">$0<span className="text-xl font-medium text-gray-600">/month</span></p>
            <ul className="space-y-3 text-gray-700 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3 saved keepsakes</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10 people in Memories</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited daily reflections</span>
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
          <PremiumCard className="p-8 border-2 border-blue-200 shadow-lg relative flex flex-col">
            <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
            <h2 className="text-3xl font-serif font-bold text-blue-900 mb-4">Pro</h2>
            <p className="text-5xl font-bold text-blue-900 mb-6">$9.99<span className="text-xl font-medium text-gray-600">/month</span></p>
            <ul className="space-y-3 text-gray-700 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited saved keepsakes</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited people in Memories</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Advanced memory organization</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI writing tools (grammar + expansion)</span>
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
        <PremiumCard className="p-8 text-center bg-gradient-to-r from-green-50 to-blue-50 mt-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="card-heading mb-2">
            Secure billing, powered by Stripe
          </h3>
          <p className="section-description mb-6">
            All payments are encrypted and PCI compliant. You can manage or cancel your plan anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <PremiumButton variant="secondary">
                Back to Dashboard
              </PremiumButton>
            </Link>
            <Link href="/vault">
              <PremiumButton>
                Start Saving Keepsakes
              </PremiumButton>
            </Link>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}