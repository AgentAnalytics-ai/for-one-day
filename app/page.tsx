import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 🏠 Landing page
 * Shows hero and CTA, or redirects to dashboard if authenticated
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
      <div className="text-center max-w-3xl">
        {/* Hero */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
          For One Day
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-4 text-balance">
          Live today. Prepare for the day that matters most.
        </p>
        
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          A simple, beautiful app for fathers to build daily rhythms of devotion, 
          family connection, and lasting legacy.
        </p>
        
        {/* Features */}
        <div className="space-y-4 mb-12 text-left max-w-xl mx-auto">
          <Feature 
            emoji="📖"
            text="A 3-minute daily devotion you'll actually do"
          />
          <Feature 
            emoji="🎮"
            text="Sunday "Table Talk" game made from your week"
          />
          <Feature 
            emoji="🗂️"
            text="A private vault for letters, videos, and documents"
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/login"
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Start Free →
          </Link>
          
          <Link
            href="#features"
            className="text-gray-700 hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Learn More
          </Link>
        </div>
        
        {/* Footer */}
        <p className="text-sm text-gray-500 mt-16">
          For One Day is a project by Agent Analytics.
        </p>
      </div>
    </main>
  )
}

function Feature({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur rounded-lg">
      <span className="text-3xl">{emoji}</span>
      <span className="text-gray-800 font-medium">{text}</span>
    </div>
  )
}

