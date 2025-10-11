import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 🏠 Premium Landing Page - 2026 Design
 * Sophisticated, trust-building experience for fathers
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/ForOneDay_HeroLockup.png"
              alt="For One Day"
              width={400}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          
          {/* Hero Copy */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-gray-900 mb-8 leading-tight">
            Live today.<br />
            <span className="font-medium">Prepare for the day that matters most.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            The premium platform for fathers building daily rhythms of devotion, 
            meaningful family connection, and lasting legacy.
          </p>
          
          {/* Primary CTA */}
          <div className="mb-20">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Your Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-center text-gray-900 mb-16">
            Everything you need to lead your family well
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Daily Devotion"
              description="Three-minute guided reflections designed for busy fathers. Build spiritual depth without overwhelm."
            />
            
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Table Talk"
              description="Transform your week into meaningful family conversations. AI-powered questions that spark connection every Sunday."
            />
            
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Legacy Vault"
              description="Secure storage for letters, videos, and documents. Your family's most precious memories, protected forever."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
            Built for fathers who want more
          </h2>
          <p className="text-xl text-gray-600 mb-16 leading-relaxed">
            Join thousands of fathers who have transformed their daily routines 
            into meaningful moments of connection and spiritual growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/login"
              className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Free Today
            </Link>
            
            <Link
              href="#features"
              className="text-gray-700 hover:text-gray-900 px-10 py-4 rounded-full text-lg font-medium transition-colors border border-gray-300 hover:border-gray-400"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-8 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/ForOneDay_PrimaryLogo.png"
              alt="For One Day"
              width={200}
              height={60}
              className="mx-auto opacity-80"
            />
          </div>
          <p className="text-gray-400 text-sm">
            For One Day is a premium family platform by Agent Analytics.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-6 group-hover:bg-primary-100 transition-colors duration-300">
        <div className="text-primary-600">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

