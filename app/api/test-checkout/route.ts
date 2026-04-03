/**
 * 🧪 Test Checkout API
 * Tests the checkout session creation directly
 */

import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/app/actions/billing-actions'
import { blockInProduction } from '@/lib/route-guards'

export async function POST() {
  const blocked = blockInProduction()
  if (blocked) return blocked

  try {
    console.log('Testing checkout session creation...')
    const result = await createCheckoutSession()
    
    console.log('Checkout session result:', result)
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('Test checkout error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
