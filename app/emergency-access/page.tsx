import { EmergencyAccessForm } from '@/components/emergency/emergency-access-form'

/**
 * 🚨 Emergency Access Request Page
 * For family members to request access to legacy notes
 */
export default function EmergencyAccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-light text-gray-900 mb-2">
            Emergency Access Request
          </h1>
          
          <p className="text-lg text-gray-600">
            Request access to legacy notes for a family member
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-blue-900 mb-3">
            Important Information
          </h2>
          <div className="text-blue-800 text-sm space-y-2">
            <p>
              <strong>This form is for family members</strong> who need to request access to legacy notes 
              when someone is unable to access their account.
            </p>
            <p>
              <strong>Verification required:</strong> We will verify your identity and relationship 
              to the account holder before granting access.
            </p>
            <p>
              <strong>Processing time:</strong> Requests are typically processed within 1-2 business days.
            </p>
            <p>
              <strong>Urgent?</strong> Call Grant directly at{' '}
              <a href="tel:+14055357750" className="underline font-bold text-blue-700">
                (405) 535-7750
              </a>
              {' '}for immediate assistance (Mon-Fri 9am-6pm CST)
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <EmergencyAccessForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This service is provided by For One Day to help families access important legacy messages.
          </p>
        </div>
      </div>
    </main>
  )
}
