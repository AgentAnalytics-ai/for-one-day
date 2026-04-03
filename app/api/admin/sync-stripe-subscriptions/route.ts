/**
 * Admin API: Sync All Stripe Subscriptions to Database
 *
 * Protected by ADMIN_API_SECRET (Authorization: Bearer … or x-admin-secret).
 * Configure a 24+ character secret in the deployment environment before calling.
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
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = createServiceRoleClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server misconfigured (service role)' }, { status: 503 })
    }
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

            // Last resort: Find by email (Auth Admin)
            if (!userId && customer.email) {
              userId = await findUserIdByEmail(customer.email)
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
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end || false
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

        const { data: authUser } = await supabase.auth.admin.getUserById(userId)

        results.synced++
        results.details.push({
          email: authUser.user?.email || 'unknown',
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
