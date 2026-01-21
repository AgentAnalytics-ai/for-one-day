/**
 * Admin API: Sync All Stripe Subscriptions to Database
 * This ensures all active Stripe subscriptions are reflected in the database
 * 
 * SECURITY: Add authentication/authorization before using in production!
 * 
 * Usage: POST /api/admin/sync-stripe-subscriptions
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

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const results = {
      synced: 0,
      errors: 0,
      notFound: 0,
      details: [] as Array<{ email: string; status: string; error?: string }>
    }

    // Get all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'all', // Get all subscriptions (active, past_due, canceled, etc.)
      limit: 100
    })

    console.log(`Found ${subscriptions.data.length} subscriptions in Stripe`)

    for (const subscription of subscriptions.data) {
      try {
        let userId: string | null = null

        // Try to get user_id from subscription metadata
        userId = subscription.metadata?.user_id || null

        // Fallback: Get from customer metadata
        if (!userId && subscription.customer) {
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          if (customer && !customer.deleted) {
            userId = customer.metadata?.user_id || null

            // Last resort: Find by email
            if (!userId && customer.email) {
              const { data: { users } } = await supabase.auth.admin.listUsers()
              const user = users?.find(u => u.email === customer.email)
              if (user) {
                userId = user.id
              }
            }
          }
        }

        if (!userId) {
          const customer = subscription.customer
          const customerObj = typeof customer === 'string' 
            ? await stripe.customers.retrieve(customer)
            : customer
          
          const email = customerObj && !customerObj.deleted ? customerObj.email : 'unknown'
          results.notFound++
          results.details.push({
            email: email || 'unknown',
            status: 'user_not_found',
            error: `No user_id found for subscription ${subscription.id}`
          })
          continue
        }

        // Upsert subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false
          }, {
            onConflict: 'id'
          })

        if (subError) {
          throw subError
        }

        // Update user's plan based on subscription status
        const plan = subscription.status === 'active' ? 'pro' : 'free'
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ plan })
          .eq('user_id', userId)

        if (profileError) {
          throw profileError
        }

        // Get user email for reporting
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const user = users?.find(u => u.id === userId)

        results.synced++
        results.details.push({
          email: user?.email || 'unknown',
          status: 'synced',
        })

      } catch (error) {
        results.errors++
        const customer = subscription.customer
        const customerObj = typeof customer === 'string' 
          ? await stripe.customers.retrieve(customer).catch(() => null)
          : customer
        
        const email = customerObj && !customerObj.deleted ? customerObj.email : 'unknown'
        results.details.push({
          email: email || 'unknown',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.error(`Error syncing subscription ${subscription.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: subscriptions.data.length,
        synced: results.synced,
        errors: results.errors,
        notFound: results.notFound
      },
      details: results.details
    })

  } catch (error) {
    console.error('Sync subscriptions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
