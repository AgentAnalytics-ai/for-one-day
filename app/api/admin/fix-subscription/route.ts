/**
 * Admin API: Manually Fix User Subscription
 * Use this to manually update a user's subscription if webhook failed
 * 
 * SECURITY: Add authentication/authorization before using in production!
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Add admin check here
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || user.email !== 'your-admin-email@example.com') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { email, plan = 'pro' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find user by email in auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }
    
    const user = users?.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user profile data
    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('user_id', user.id)

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
                user_id: user.id,
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
      userId: user.id
    })

  } catch (error) {
    console.error('Fix subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
