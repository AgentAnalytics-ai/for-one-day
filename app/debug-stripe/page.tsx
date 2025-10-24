/**
 * 🔧 Stripe Debug Page
 * Check Stripe configuration and environment variables
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugStripePage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check environment variables
  const envCheck = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? '✅ Set' : '❌ Missing',
  }

  // Check Stripe client initialization
  let stripeStatus = '❌ Not initialized'
  try {
    const { stripe } = await import('@/lib/stripe')
    stripeStatus = stripe ? '✅ Initialized' : '❌ Failed to initialize'
  } catch (error) {
    stripeStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Stripe Configuration Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envCheck).map(([key, status]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b">
                <code className="text-sm font-mono">{key}</code>
                <span className="text-sm">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stripe Client Status</h2>
          <div className="flex justify-between items-center py-2">
            <span>Stripe Client</span>
            <span className="text-sm">{stripeStatus}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Values</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Price ID:</strong> {process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'Not set'}
            </div>
            <div>
              <strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}
            </div>
            <div>
              <strong>Publishable Key (first 10 chars):</strong> {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'Not set'}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/upgrade" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Upgrade Page
          </a>
        </div>
      </div>
    </div>
  )
}
