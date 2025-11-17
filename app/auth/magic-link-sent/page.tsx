import Link from 'next/link'
import { Header } from '@/components/header'

/**
 * ✉️ Magic Link Sent - Professional Confirmation
 * Beautiful confirmation page with clear next steps
 */
export default async function MagicLinkSentPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ email?: string }> 
}) {
  const resolvedSearchParams = await searchParams
  const email = resolvedSearchParams.email || 'your email'

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-serif font-light text-gray-900 mb-2">
            Check your email
          </h2>
          
          <p className="text-center text-lg text-gray-600 mb-8">
            We&apos;ve sent a magic link to <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div className="mt-8">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
          
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900">
              What&apos;s next?
            </h3>
            
            <div className="text-left space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-xs">1</span>
                </div>
                <p>Check your email inbox (and spam folder)</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-xs">2</span>
                </div>
                <p>Click the &quot;Sign in to For One Day&quot; link</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-xs">3</span>
                </div>
                <p>You&apos;ll be automatically signed in and redirected to your dashboard</p>
              </div>
            </div>
          </div>

          {/* Resend Option */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Send another magic link
            </Link>
          </div>

          {/* Alternative Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Or try a different sign-in method:
            </p>
            
            <div className="space-y-3">
              <Link
                href="/auth/password"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign in with password
              </Link>
              
              <Link
                href="/auth/signup"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
          
          {/* Trust Elements */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure magic link · ⚡ Expires in 1 hour · 💝 Your personal legacy vault
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
