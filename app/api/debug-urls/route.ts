/**
 * 🔍 Debug URLs API Endpoint
 * Checks URL configuration for Stripe
 */

import { NextResponse } from 'next/server'
import { blockInProduction } from '@/lib/route-guards'

export async function GET() {
  const blocked = blockInProduction()
  if (blocked) return blocked

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const successUrl = `${siteUrl}/dashboard?success=true`
    const cancelUrl = `${siteUrl}/upgrade?canceled=true`
    
    // Test URL validity
    const urlValidation = {
      siteUrl: siteUrl || '❌ Missing',
      successUrl: '❌ Invalid',
      cancelUrl: '❌ Invalid',
      errors: [] as string[]
    }
    
    if (siteUrl) {
      try {
        new URL(successUrl)
        urlValidation.successUrl = '✅ Valid'
      } catch (error) {
        urlValidation.successUrl = '❌ Invalid'
        urlValidation.errors.push(`Success URL error: ${error}`)
      }
      
      try {
        new URL(cancelUrl)
        urlValidation.cancelUrl = '✅ Valid'
      } catch (error) {
        urlValidation.cancelUrl = '❌ Invalid'
        urlValidation.errors.push(`Cancel URL error: ${error}`)
      }
    } else {
      urlValidation.errors.push('NEXT_PUBLIC_SITE_URL is missing')
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      urls: {
        NEXT_PUBLIC_SITE_URL: siteUrl,
        successUrl,
        cancelUrl
      },
      validation: urlValidation,
      recommendations: siteUrl ? [] : [
        'Set NEXT_PUBLIC_SITE_URL in Vercel environment variables',
        'Use: https://for-one-day.vercel.app'
      ]
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
