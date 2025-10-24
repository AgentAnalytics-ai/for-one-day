'use client'

/**
 * 🔧 Stripe Portal Setup Instructions
 * Helps users understand how to configure Stripe Customer Portal
 */
export function StripePortalSetup() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Stripe Customer Portal Setup Required
          </h3>
          <div className="text-yellow-700 text-sm space-y-3">
            <p>
              The &ldquo;Manage Subscription&rdquo; feature requires Stripe Customer Portal to be configured. 
              Here&apos;s how to set it up:
            </p>
            
            <div className="bg-white p-4 rounded-md border border-yellow-300">
              <h4 className="font-medium text-yellow-800 mb-2">Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to <a href="https://dashboard.stripe.com/settings/billing/portal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Stripe Dashboard → Settings → Billing → Customer Portal</a></li>
                <li>Click &ldquo;Activate test link&rdquo; (for testing) or &ldquo;Activate live link&rdquo; (for production)</li>
                <li>Configure the portal settings:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Allow customers to update payment methods</li>
                    <li>Allow customers to view billing history</li>
                    <li>Allow customers to cancel subscriptions</li>
                    <li>Set business information and branding</li>
                  </ul>
                </li>
                <li>Save the configuration</li>
                <li>Test the &ldquo;Manage Subscription&rdquo; button again</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This is a one-time setup in your Stripe Dashboard. 
                Once configured, the &ldquo;Manage Subscription&rdquo; feature will work for all Pro users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
