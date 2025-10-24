/**
 * 💳 Stripe Checkout Session API
 * Creates checkout sessions for subscription upgrades
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { StripeError } from '@/lib/stripe'

export async function POST() {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's profile and Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Check if user already has an active subscription
    if (profile.subscription_status === 'pro' || profile.subscription_status === 'lifetime') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    let customerId = profile.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const customer = await stripe!.customers.create({
        email: user.email,
        name: userProfile?.full_name || undefined,
        metadata: {
          user_id: user.id,
          app: 'for-one-day'
        }
      })

      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Create checkout session
    const session = await stripe!.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: STRIPE_CONFIG.SUCCESS_URL,
      cancel_url: STRIPE_CONFIG.CANCEL_URL,
      metadata: {
        user_id: user.id,
        plan: 'pro'
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: 'pro'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      tax_id_collection: {
        enabled: true,
      },
    })

    if (!session.url) {
      throw new StripeError('Failed to create checkout session')
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
