/**
 * Admin API: Manually Fix User Subscription (e.g. if webhook failed).
 *
 * Protected by ADMIN_API_SECRET (Authorization: Bearer … or x-admin-secret).
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireAdminApiSecret } from '@/lib/route-guards'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { findUserIdByEmail } from '@/lib/auth-admin'

export async function POST(request: NextRequest) {
  const denied = requireAdminApiSecret(request)
  if (denied) return denied

  try {
    const { email, plan = 'pro' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server misconfigured (service role)' }, { status: 503 })
    }

    const userId = await findUserIdByEmail(email)
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user profile data
    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id, stripe_customer_id')
      .eq('user_id', userId)
      .single()

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If user has Stripe customer ID, check subscription status
    if (userData?.stripe_customer_id && stripe) {
      try {
        const customers = await stripe.customers.list({
          email: email,
          limit: 1
        })

        if (customers.data.length > 0) {
          const customer = customers.data[0]
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 1
          })

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0]
            
            // Sync subscription to database
            await supabase
              .from('subscriptions')
              .upsert({
                id: subscription.id,
                user_id: userId,
                status: subscription.status,
                price_id: subscription.items.data[0]?.price.id,
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: (subscription as any).cancel_at_period_end || false
              })
          }
        }
      } catch (stripeError) {
        console.error('Stripe sync error:', stripeError)
        // Don't fail if Stripe sync fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${email} to ${plan} plan`,
      userId
    })

  } catch (error) {
    console.error('Fix subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
