import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signUp } from '@/app/auth/actions'
import { Header } from '@/components/header'

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-gray-900 mb-3 sm:mb-4 leading-tight">
              {inviteFamilyId ? 'Join your family' : 'Start your legacy journey'}
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              {inviteFamilyId 
                ? 'You\'ve been invited to join a family on For One Day.'
                : 'Join thousands documenting their life story.'
              }
            </p>
          </div>

          <div className="bg-white py-8 sm:py-10 px-6 sm:px-8 md:px-10 shadow-xl rounded-2xl border border-gray-200/50">
          
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
          <form action={signUp} className="space-y-5 sm:space-y-6">
            {/* Hidden fields for invitation */}
            {inviteFamilyId && (
              <>
                <input type="hidden" name="invite" value={inviteFamilyId} />
                <input type="hidden" name="role" value={inviteRole} />
              </>
            )}
            
            <div>
              <label htmlFor="full-name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full name
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none block w-full px-4 py-3.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-4 py-3.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
                placeholder="Create a strong password"
              />
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>At least 8 characters</span>
                </div>
              </div>
            </div>

            <div className="flex items-start pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Today
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 sm:mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
          
          {/* Trust Elements */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              🔒 Secure authentication · 🚀 Fast & lightweight · 💝 Your personal legacy vault
            </p>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
