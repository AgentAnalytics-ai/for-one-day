/**
 * 💳 Stripe Configuration & Client Setup
 * Professional Stripe integration for For One Day
 */

import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe client
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return null
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Stripe configuration
export const STRIPE_CONFIG = {
  // Your live price IDs
  PRICE_IDS: {
    PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
  },
  
  // Webhook configuration
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Success/cancel URLs - Use production URL as fallback
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://for-one-day.vercel.app'}/dashboard?success=true`,
  CANCEL_URL: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://for-one-day.vercel.app'}/upgrade?canceled=true`,
}

// Subscription status helpers
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  UNPAID: 'unpaid',
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// Check if subscription is active
export function isSubscriptionActive(status: string): boolean {
  return status === SUBSCRIPTION_STATUS.ACTIVE || status === SUBSCRIPTION_STATUS.TRIALING
}

// Get subscription plan from price ID
export function getPlanFromPriceId(priceId: string): 'free' | 'pro' | 'lifetime' {
  if (priceId === STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY) {
    return 'pro'
  }
  return 'free'
}

// Stripe error handling
export class StripeError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'StripeError'
  }
}

// Validate URLs for Stripe
export function validateStripeUrls(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    const successUrl = new URL(STRIPE_CONFIG.SUCCESS_URL)
    const cancelUrl = new URL(STRIPE_CONFIG.CANCEL_URL)
    
    // Check if URLs are HTTPS
    if (successUrl.protocol !== 'https:') {
      errors.push('Success URL must use HTTPS')
    }
    if (cancelUrl.protocol !== 'https:') {
      errors.push('Cancel URL must use HTTPS')
    }
    
    // Check if URLs are not localhost in production
    if (process.env.NODE_ENV === 'production') {
      if (successUrl.hostname === 'localhost' || successUrl.hostname === '127.0.0.1') {
        errors.push('Success URL cannot be localhost in production')
      }
      if (cancelUrl.hostname === 'localhost' || cancelUrl.hostname === '127.0.0.1') {
        errors.push('Cancel URL cannot be localhost in production')
      }
    }
    
  } catch (error) {
    errors.push(`URL validation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate Stripe webhook signature
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripe) {
    throw new StripeError('Stripe client not initialized')
  }
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    throw new StripeError(`Webhook signature verification failed: ${err}`)
  }
}
