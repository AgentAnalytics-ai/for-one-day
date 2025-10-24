/**
 * 🧪 Test Stripe Flow API
 * Comprehensive test of the complete Stripe checkout flow
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/app/actions/billing-actions'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    // Test the complete checkout flow
    console.log('Testing Stripe checkout flow for user:', user.id)
    
    const result = await createCheckoutSession()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      checkoutResult: result,
      analysis: {
        hasUrl: !!result.url,
        isSuccess: result.success,
        errorType: result.error ? 'Stripe Error' : 'No Error',
        nextStep: result.success ? 'Redirect to Stripe' : 'Fix Error'
      }
    })

  } catch (error) {
    console.error('Stripe flow test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
