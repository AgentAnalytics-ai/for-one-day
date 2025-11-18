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
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-start sm:items-center justify-center pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-gray-900 mb-4 sm:mb-5 leading-tight tracking-tight">
              Welcome back
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-sm mx-auto font-light">
              Continue your legacy journey
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white py-10 sm:py-12 px-6 sm:px-8 rounded-3xl border border-gray-200 shadow-lg">
          
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
              className="w-full flex justify-center items-center py-4.5 px-6 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Sign Up Link */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">New to For One Day?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-3.5 px-4 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Create your account
              </Link>
            </div>
          </div>
          
          {/* Trust Elements */}
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              🔒 Secure · 🚀 Fast · 💝 Your legacy vault
            </p>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}