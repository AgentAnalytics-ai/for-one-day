import Link from 'next/link'
import Image from 'next/image'
import { unsubscribeUser } from '@/app/actions/unsubscribe-actions'

/**
 * 🚫 Unsubscribe Page
 * Allows users to unsubscribe from emails
 */
export default async function UnsubscribePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ email?: string; success?: string; error?: string }> 
}) {
  const resolvedSearchParams = await searchParams
  const email = resolvedSearchParams.email
  const success = resolvedSearchParams.success
  const error = resolvedSearchParams.error

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/ForOneDay_PrimaryLogo.png"
              alt="For One Day"
              width={200}
              height={60}
              priority
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    You&apos;ve been unsubscribed
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    You won&apos;t receive any more marketing emails from For One Day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Unable to unsubscribe
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {error === 'email-required' && 'Email address is required'}
                    {error === 'user-not-found' && 'We couldn&apos;t find an account with that email'}
                    {error === 'processing-error' && 'An error occurred. Please try again'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unsubscribe Form */}
          {!success && (
            <>
              <h1 className="text-2xl font-serif font-light text-gray-900 mb-2 text-center">
                Unsubscribe from Emails
              </h1>
              
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address to stop receiving marketing emails from For One Day.
              </p>

              <form action={unsubscribeUser} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email || ''}
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Unsubscribe
                </button>
              </form>
            </>
          )}

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Note about transactional emails */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Note: You will still receive important account-related emails such as password resets 
              and order confirmations.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

