/**
 * 🔗 Stripe Webhook Handler
 * Processes Stripe events for subscription management
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { syncFamilyEntitlement } from '@/lib/household-billing'
import { stripe, STRIPE_CONFIG, validateWebhookSignature } from '@/lib/stripe'
import { StripeError } from '@/lib/stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getAdminClient(): SupabaseClient {
  const client = createServiceRoleClient()
  if (!client) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured — webhook cannot write entitlements')
  }
  return client
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const end = (subscription as any).current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

async function resolveUserId(
  supabase: SupabaseClient,
  metadataUserId: string | undefined,
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
): Promise<string | null> {
  if (metadataUserId) return metadataUserId

  if (!customerId || !stripe) return null

  try {
    const customerRef =
      typeof customerId === 'string' ? customerId : customerId.id
    const customer = await stripe.customers.retrieve(customerRef)
    if (customer && !customer.deleted && customer.metadata?.user_id) {
      return customer.metadata.user_id
    }
    if (customer && !customer.deleted && customer.email) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const user = users?.find((u) => u.email === customer.email)
      return user?.id ?? null
    }
  } catch (error) {
    console.error('Error resolving user from customer:', error)
  }

  return null
}

async function grantProAccess(
  supabase: SupabaseClient,
  userId: string,
  params: {
    stripeSubscriptionId?: string | null
    stripeCustomerId?: string | null
    currentPeriodEnd?: string | null
  }
) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ plan: 'pro' })
    .eq('user_id', userId)

  if (profileError) throw profileError

  await syncFamilyEntitlement(supabase, userId, {
    plan: 'pro',
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
    stripeCustomerId: params.stripeCustomerId ?? null,
    currentPeriodEnd: params.currentPeriodEnd ?? null,
  })
}

async function revokeProAccess(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.plan === 'lifetime') return

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ plan: 'free' })
    .eq('user_id', userId)

  if (profileError) throw profileError

  await syncFamilyEntitlement(supabase, userId, {
    plan: 'free',
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
  })
}

export async function POST(request: NextRequest) {
  try {
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

    const event = validateWebhookSignature(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    )

    console.log(`Processing Stripe event: ${event.type}`)

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
  const supabase = getAdminClient()
  const userId = await resolveUserId(supabase, session.metadata?.user_id, session.customer)

  if (!userId) {
    console.error('No user_id found in checkout session. Session ID:', session.id)
    return
  }

  console.log(`Checkout completed for user: ${userId}`)

  await grantProAccess(supabase, userId, {
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
    stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
  })

  console.log(`Successfully updated user ${userId} to pro plan`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()
  const userId = await resolveUserId(supabase, subscription.metadata?.user_id, subscription.customer)

  if (!userId) {
    console.error('No user_id found in subscription. Subscription ID:', subscription.id)
    return
  }

  console.log(`Subscription created for user: ${userId}`)

  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      id: subscription.id,
      user_id: userId,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: subscriptionPeriodEnd(subscription),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
    }, { onConflict: 'id' })

  if (subError) throw subError

  if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
    await grantProAccess(supabase, userId, {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
    })
  }

  console.log(`Successfully created subscription for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()
  const userId = await resolveUserId(supabase, subscription.metadata?.user_id, subscription.customer)

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Subscription updated for user: ${userId}`)

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: subscriptionPeriodEnd(subscription),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
    })
    .eq('id', subscription.id)

  if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
    await grantProAccess(supabase, userId, {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
    })
  } else {
    await revokeProAccess(supabase, userId)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()
  const userId = await resolveUserId(supabase, subscription.metadata?.user_id, subscription.customer)

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Subscription deleted for user: ${userId}`)

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscription.id)

  await revokeProAccess(supabase, userId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = getAdminClient()

  if (!(invoice as any).subscription) return

  const subscription = await stripe!.subscriptions.retrieve((invoice as any).subscription as string)
  const userId = await resolveUserId(supabase, subscription.metadata?.user_id, subscription.customer)

  if (!userId) {
    console.error('No user_id found for payment. Invoice ID:', invoice.id)
    return
  }

  console.log(`Payment succeeded for user: ${userId}`)

  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('id', subscription.id)

  await grantProAccess(supabase, userId, {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  })

  console.log(`Successfully updated user ${userId} to pro plan after payment`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getAdminClient()

  if (!(invoice as any).subscription) return

  const subscription = await stripe!.subscriptions.retrieve((invoice as any).subscription as string)
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`Payment failed for user: ${userId}`)

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('id', subscription.id)
}

async function storeWebhookEvent(event: Stripe.Event) {
  const supabase = getAdminClient()

  try {
    await supabase
      .from('subscription_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        subscription_id: (event.data.object as Stripe.Subscription)?.id || null,
        customer_id: (event.data.object as Stripe.Customer)?.id || null,
        data: event.data.object,
      })
  } catch (error) {
    console.error('Failed to store webhook event:', error)
  }
}
