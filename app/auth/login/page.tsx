import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

/**
 * 🔐 Login page
 */
export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Already logged in? Go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            For One Day
          </h1>
          <p className="text-gray-600">
            Sign in to continue your journey
          </p>
        </div>
        
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-900">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-900">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

