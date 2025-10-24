/**
 * 🔗 Stripe Webhook Handler
 * Processes Stripe events for subscription management
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_CONFIG, validateWebhookSignature } from '@/lib/stripe'
import { StripeError } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured')
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Validate webhook signature
    const event = validateWebhookSignature(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    )

    console.log(`Processing Stripe event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Store the event for tracking
    await storeWebhookEvent(event)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createClient()
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error('No user_id in checkout session metadata')
    return
  }

  console.log(`Checkout completed for user: ${userId}`)

  // Update user's subscription status to pro
  await supabase
    .from('profiles')
    .update({ 
      plan: 'pro'
    })
    .eq('user_id', userId)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = await createClient()
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Subscription created for user: ${userId}`)

  // Insert subscription record
  await supabase
    .from('subscriptions')
    .insert({
      id: subscription.id,
      user_id: userId,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false
    })

  // Update user's subscription status
  await supabase
    .from('profiles')
    .update({ 
      plan: 'pro'
    })
    .eq('user_id', userId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = await createClient()
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Subscription updated for user: ${userId}`)

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false
    })
    .eq('id', subscription.id)

  // Update user's subscription status
  const subscriptionStatus = subscription.status === 'active' ? 'pro' : 'free'
  await supabase
    .from('profiles')
    .update({ 
      plan: subscriptionStatus
    })
    .eq('user_id', userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = await createClient()
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Subscription deleted for user: ${userId}`)

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscription.id)

  // Update user's subscription status to free
  await supabase
    .from('profiles')
    .update({ 
      plan: 'free'
    })
    .eq('user_id', userId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = await createClient()
  
  if (!(invoice as any).subscription) return

  // Get subscription details
  const subscription = await stripe!.subscriptions.retrieve((invoice as any).subscription as string)
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Payment succeeded for user: ${userId}`)

  // Update subscription status to active
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('id', subscription.id)

  await supabase
    .from('profiles')
    .update({ 
      plan: 'pro'
    })
    .eq('user_id', userId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = await createClient()
  
  if (!(invoice as any).subscription) return

  // Get subscription details
  const subscription = await stripe!.subscriptions.retrieve((invoice as any).subscription as string)
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Payment failed for user: ${userId}`)

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('id', subscription.id)
}

async function storeWebhookEvent(event: Stripe.Event) {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('subscription_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        subscription_id: (event.data.object as Stripe.Subscription)?.id || null,
        customer_id: (event.data.object as Stripe.Customer)?.id || null,
        data: event.data.object
      })
  } catch (error) {
    console.error('Failed to store webhook event:', error)
    // Don't throw - this is just for tracking
  }
}
