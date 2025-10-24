/**
 * 🔧 Professional Environment Variable Checker
 * Comprehensive validation of all required environment variables
 */

import { NextResponse } from 'next/server'
import { validateStripeUrls } from '@/lib/stripe'

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      variables: {
        // Core App Variables
        NEXT_PUBLIC_SITE_URL: {
          value: process.env.NEXT_PUBLIC_SITE_URL || '❌ Missing',
          status: process.env.NEXT_PUBLIC_SITE_URL ? '✅ Set' : '❌ Missing',
          required: true
        },
        
        // Supabase Variables
        NEXT_PUBLIC_SUPABASE_URL: {
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          status: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          required: true
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
          status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
          required: true
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
          status: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
          required: true
        },
        
        // Stripe Variables
        STRIPE_SECRET_KEY: {
          value: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
          status: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
          required: true
        },
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
          value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
          status: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
          required: true
        },
        NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: {
          value: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '❌ Missing',
          status: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? '✅ Set' : '❌ Missing',
          required: true
        },
        STRIPE_WEBHOOK_SECRET: {
          value: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
          status: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
          required: true
        }
      },
      
      // URL Validation
      urlValidation: validateStripeUrls(),
      
      // Recommendations
      recommendations: [] as string[]
    }
    
    // Generate recommendations
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      checks.recommendations.push('Set NEXT_PUBLIC_SITE_URL to your production domain (e.g., https://for-one-day.vercel.app)')
    } else if (process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
      checks.recommendations.push('NEXT_PUBLIC_SITE_URL should not be localhost in production')
    } else if (process.env.NEXT_PUBLIC_SITE_URL.includes('git-main')) {
      checks.recommendations.push('Consider using your main production domain instead of git-specific URL')
    }
    
    if (!checks.urlValidation.isValid) {
      checks.recommendations.push('Fix URL validation errors: ' + checks.urlValidation.errors.join(', '))
    }
    
    // Overall status
    const missingRequired = Object.values(checks.variables).filter(v => v.required && v.status === '❌ Missing')
    const overallStatus = missingRequired.length === 0 && checks.urlValidation.isValid ? '✅ All Good' : '❌ Issues Found'
    
    return NextResponse.json({
      ...checks,
      overallStatus,
      missingCount: missingRequired.length
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
