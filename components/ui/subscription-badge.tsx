'use client'

import { PremiumCard } from './premium-card'
import { createCheckoutSession } from '@/app/actions/billing-actions'

interface SubscriptionBadgeProps {
  tier: 'free' | 'pro' | 'lifetime'
  className?: string
}

export function SubscriptionBadge({ tier, className = '' }: SubscriptionBadgeProps) {
  const config = {
    free: {
      label: 'Free',
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    pro: {
      label: 'Pro',
      color: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    lifetime: {
      label: 'Lifetime',
      color: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  }

  const tierConfig = config[tier]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${tierConfig.color} border ${tierConfig.borderColor} rounded-full ${tierConfig.textColor} text-sm font-medium ${className}`}>
      {tierConfig.icon}
      {tierConfig.label}
    </div>
  )
}

interface FeatureLimitProps {
  current: number
  limit: number
  tier: 'free' | 'pro' | 'lifetime'
  feature: string
}

export function FeatureLimit({ current, limit, tier, feature }: FeatureLimitProps) {
  const isAtLimit = current >= limit
  const isUnlimited = limit === -1
  
  if (isUnlimited) {
    return (
      <div className="text-sm text-gray-600">
        {feature}: <span className="font-medium text-green-600">Unlimited</span>
      </div>
    )
  }

  return (
    <div className="text-sm text-gray-600">
      {feature}: <span className={`font-medium ${isAtLimit ? 'text-red-600' : 'text-gray-900'}`}>
        {current}/{limit}
      </span>
      {isAtLimit && tier === 'free' && (
        <button 
          onClick={async () => {
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
              } else {
                console.error('Unexpected upgrade result:', result)
                alert('Upgrade failed: Unexpected error occurred')
              }
            } catch (error) {
              console.error('Upgrade failed:', error)
              alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }}
          className="ml-2 text-xs text-blue-600 hover:text-blue-700 cursor-pointer underline"
        >
          Upgrade to Pro →
        </button>
      )}
    </div>
  )
}

interface SubscriptionUpgradeProps {
  currentTier: 'free' | 'pro' | 'lifetime'
  className?: string
}

export function SubscriptionUpgrade({ currentTier, className = '' }: SubscriptionUpgradeProps) {
  if (currentTier === 'lifetime') {
    return null // No upgrade needed
  }

  const nextTier = currentTier === 'free' ? 'pro' : 'lifetime'
  const benefits = {
    pro: [
      'Unlimited reflections',
      'Family sharing',
      'Advanced analytics',
      'Priority support'
    ],
    lifetime: [
      'Everything in Pro',
      'Lifetime access',
      'Exclusive content',
      'VIP community'
    ]
  }

  const handleUpgrade = async () => {
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
      } else {
        console.error('Unexpected upgrade result:', result)
        alert('Upgrade failed: Unexpected error occurred')
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <PremiumCard className={`p-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upgrade to {nextTier === 'pro' ? 'Pro' : 'Lifetime'}
        </h3>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          {benefits[nextTier].map((benefit, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
        <button 
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-blue-900 to-green-800 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-800 hover:to-green-700 transition-all"
        >
          Upgrade Now - $9.99/month
        </button>
      </div>
    </PremiumCard>
  )
}
