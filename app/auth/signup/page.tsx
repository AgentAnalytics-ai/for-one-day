import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signUp } from '@/app/auth/actions'

/**
 * 🔐 Premium Sign Up Page - Billion-Dollar Authentication Experience
 * Professional, trust-building signup with multiple options
 */
export default async function SignUpPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string; invite?: string; role?: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams.error
  const inviteFamilyId = resolvedSearchParams.invite
  const inviteRole = resolvedSearchParams.role || 'spouse'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-800 via-gray-50 to-blue-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
        
        <h2 className="text-center text-3xl font-serif font-light text-gray-900 mb-2">
          {inviteFamilyId ? 'Join your family' : 'Start your legacy journey'}
        </h2>
        
        <p className="text-center text-lg text-gray-600 mb-8">
          {inviteFamilyId 
            ? 'You\'ve been invited to join a family on For One Day.'
            : 'Join thousands of fathers building what lasts.'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Direct to Email Signup */}

          {/* Email Signup Form */}
          <form action={signUp} className="space-y-6">
            {/* Hidden fields for invitation */}
            {inviteFamilyId && (
              <>
                <input type="hidden" name="invite" value={inviteFamilyId} />
                <input type="hidden" name="role" value={inviteRole} />
              </>
            )}
            
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full name
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-lg"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-lg"
                placeholder="Create a strong password"
              />
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>At least 8 characters</span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Start Free Today
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
          
          {/* Trust Elements */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure authentication · 🚀 Fast & lightweight · 💝 Built for fathers
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
