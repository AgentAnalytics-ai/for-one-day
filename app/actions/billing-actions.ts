/**
 * 💳 Billing Server Actions
 * Handles subscription management and billing operations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_CONFIG, validateStripeUrls } from '@/lib/stripe'

/**
 * Create a Stripe checkout session for subscription upgrade
 */
export async function createCheckoutSession() {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return { success: false, error: 'Payment processing not configured - missing Stripe keys' }
    }

    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PRO_PRICE_ID')
      return { success: false, error: 'Payment processing not configured - missing price ID' }
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error('Missing NEXT_PUBLIC_SITE_URL')
      return { success: false, error: 'Payment processing not configured - missing site URL' }
    }

    // Professional URL validation
    const urlValidation = validateStripeUrls()
    if (!urlValidation.isValid) {
      console.error('Stripe URL validation failed:', urlValidation.errors)
      return { 
        success: false, 
        error: `URL configuration error: ${urlValidation.errors.join(', ')}` 
      }
    }
    
    const successUrl = STRIPE_CONFIG.SUCCESS_URL
    const cancelUrl = STRIPE_CONFIG.CANCEL_URL

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's profile (or create if missing)
    console.log('Fetching profile for user:', user.id)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single()

    let profile = profileData

    // If profile doesn't exist, create one
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating default profile for user:', user.id)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          plan: 'free',
          full_name: user.email?.split('@')[0] || 'User'
        })
        .select('stripe_customer_id, plan')
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return { success: false, error: `Failed to create user profile: ${createError.message}` }
      }

      profile = newProfile
      console.log('Profile created successfully:', profile)
    } else if (profileError) {
      console.error('Error fetching profile:', profileError)
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      return { success: false, error: `Failed to fetch user profile: ${profileError.message}` }
    } else {
      console.log('Profile fetched successfully:', profile)
    }

    // Ensure we have a profile at this point
    if (!profile) {
      return { success: false, error: 'Failed to fetch or create user profile' }
    }

    // Check if user already has an active subscription
    if (profile.plan === 'pro' || profile.plan === 'lifetime') {
      return { success: false, error: 'You already have an active subscription!' }
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
        name: userProfile?.full_name || user.email?.split('@')[0] || 'Customer',
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
    console.log('Creating Stripe checkout session with:', {
      customer: customerId,
      price: STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY,
      success_url: successUrl,
      cancel_url: cancelUrl
    })
    
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
      success_url: successUrl,
      cancel_url: cancelUrl,
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
      // Disable tax ID collection to avoid customer update issues
      tax_id_collection: {
        enabled: false,
      },
      // Allow customer updates for future tax collection
      customer_update: {
        name: 'auto',
        address: 'auto'
      },
    })

    console.log('Stripe session created:', session.id)

    if (!session.url) {
      return { success: false, error: 'Failed to create checkout session' }
    }

    // Return the checkout URL instead of redirecting
    return { success: true, url: session.url }

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session'
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        errorMessage = 'Invalid price configuration - please contact support'
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Payment system configuration error - please contact support'
      } else if (error.message.includes('Not a valid URL')) {
        errorMessage = 'URL configuration error - please contact support'
      } else {
        errorMessage = `Payment error: ${error.message}`
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Create a customer portal session for subscription management
 */
export async function createPortalSession() {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return { success: false, error: 'Payment processing not configured - missing Stripe keys' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return { success: false, error: 'Authentication required' }
    }

    console.log('Creating portal session for user:', user.id)

    // Get user's Stripe customer ID and subscription status (or create if missing)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single()

    let profile = profileData

    // If profile doesn't exist, create one
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating default profile for user:', user.id)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          plan: 'free',
          full_name: user.email?.split('@')[0] || 'User'
        })
        .select('stripe_customer_id, plan')
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return { success: false, error: `Failed to create user profile: ${createError.message}` }
      }

      profile = newProfile
      console.log('Profile created successfully:', profile)
    } else if (profileError) {
      console.error('Error fetching profile:', profileError)
      return { success: false, error: `Failed to fetch user profile: ${profileError.message}` }
    } else {
      console.log('Profile fetched:', profile)
    }

    // Ensure we have a profile at this point
    if (!profile) {
      return { success: false, error: 'Failed to fetch or create user profile' }
    }

    // Check if user has a subscription
    if (profile.plan === 'free') {
      return { success: false, error: 'You need an active subscription to manage billing. Please upgrade to Pro first.' }
    }

    // Check if user has a Stripe customer ID
    if (!profile.stripe_customer_id) {
      console.error('No Stripe customer ID found for user:', user.id)
      return { success: false, error: 'No billing information found. Please contact support.' }
    }

    console.log('Creating portal session for customer:', profile.stripe_customer_id)

    // Create portal session
    const session = await stripe!.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foroneday.app'}/dashboard`,
    })

    console.log('Portal session created successfully:', session.id)

    // Return the portal URL instead of redirecting
    return { success: true, url: session.url }

  } catch (error) {
    console.error('Portal session creation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create portal session'
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        errorMessage = 'Customer not found in billing system. Please contact support.'
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Payment system configuration error. Please contact support.'
      } else if (error.message.includes('No configuration provided')) {
        errorMessage = 'Stripe Customer Portal needs to be configured. Please contact support to set up subscription management.'
      } else if (error.message.includes('Portal default')) {
        errorMessage = 'Stripe Customer Portal configuration required. Please contact support.'
      } else {
        errorMessage = `Portal error: ${error.message}`
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Get user's subscription status and details
 */
export async function getUserSubscriptionStatus(userId: string) {
  try {
    const supabase = await createClient()
    
    // Get user's profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        plan,
        stripe_customer_id
      `)
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching subscription status:', profileError)
      return {
        plan: 'free' as const,
        status: 'free' as const,
        isActive: false,
        endsAt: null,
        trialEndsAt: null
      }
    }

    // Get active subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      plan: profile.plan as 'free' | 'pro' | 'lifetime',
      status: subscription?.status || 'free',
      isActive: subscription?.status === 'active' || subscription?.status === 'trialing',
      endsAt: subscription?.current_period_end || null,
      trialEndsAt: null,
      subscription: subscription || null
    }

  } catch (error) {
    console.error('Error getting subscription status:', error)
    return {
      plan: 'free' as const,
      status: 'free' as const,
      isActive: false,
      endsAt: null,
      trialEndsAt: null
    }
  }
}

/**
 * Check if user can create a legacy note (respects subscription limits)
 */
export async function canCreateLegacyNote(userId: string): Promise<{
  canCreate: boolean
  current: number
  limit: number
  message?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get user's subscription status
    const subscriptionStatus = await getUserSubscriptionStatus(userId)
    
    // Pro and lifetime users have unlimited legacy notes
    if (subscriptionStatus.plan === 'pro' || subscriptionStatus.plan === 'lifetime') {
      return {
        canCreate: true,
        current: 0,
        limit: -1
      }
    }

    // Count current legacy notes for free users
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single()

    if (!familyMember) {
      return {
        canCreate: true,
        current: 0,
        limit: 3
      }
    }

    const { count } = await supabase
      .from('vault_items')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyMember.family_id)
      .eq('owner_id', userId)
      .eq('kind', 'letter')

    const current = count || 0
    const limit = 3
    const canCreate = current < limit

    return {
      canCreate,
      current,
      limit,
      message: canCreate 
        ? undefined 
        : `You've reached your limit of ${limit} legacy notes. Upgrade to Pro for unlimited notes.`
    }

  } catch (error) {
    console.error('Error checking legacy note limit:', error)
    return {
      canCreate: false,
      current: 0,
      limit: 3,
      message: 'Error checking subscription limits'
    }
  }
}