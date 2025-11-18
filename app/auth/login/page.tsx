import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
// Removed Google and Magic Link authentication

/**
 * 🔐 Premium Login Page - Billion-Dollar Authentication Experience
 * Professional, trust-building design with multiple auth options
 */
export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams.error

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-gray-900 mb-3 sm:mb-4 leading-tight">
              Welcome back
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              Continue your legacy journey
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

          {/* Direct to Password Login */}
          <div className="text-center">
            <Link
              href="/auth/password"
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </Link>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 sm:mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">New to For One Day?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create your account
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