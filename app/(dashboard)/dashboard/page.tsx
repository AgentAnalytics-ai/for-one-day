import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'

/**
 * 🏠 Dashboard - Today's Invitation
 * Emotional, not functional. Sacred space for fathers.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = format(new Date(), 'EEEE, MMMM d')
  const timeOfDay = new Date().getHours()
  const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening'

  // Get user profile for subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-2">
          {greeting}
        </h1>
        <p className="text-xl text-gray-600 mb-4">{today}</p>
        <SubscriptionBadge tier={profile?.plan || 'free'} />
      </div>

      {/* Today's Invitation - Hero Card */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 rounded-2xl p-8 md:p-12 border border-orange-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
            Today's Reflection
          </h2>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
            <p className="text-lg text-gray-700 italic mb-4">
              &ldquo;Give thanks in all circumstances; for this is God&apos;s will for you in Christ Jesus.&rdquo;
            </p>
            <p className="text-sm text-gray-600">1 Thessalonians 5:18</p>
          </div>
          
          <p className="text-xl text-gray-800 mb-8 leading-relaxed">
            What unexpected blessing did you notice today?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reflection"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Your Reflection
            </Link>
            
            <Link
              href="/vault"
              className="inline-flex items-center gap-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 hover:text-orange-800 px-8 py-4 rounded-full text-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Record Voice Note
            </Link>
          </div>
        </div>
      </div>

      {/* Family Impact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FamilyImpactCard />
        <LegacyMomentCard />
      </div>

      {/* Dynamic Stats - Connected to Supabase */}
      <DynamicStats userId={user.id} />
    </div>
  )
}

function FamilyImpactCard() {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-medium text-gray-900">Tonight, Share This</h3>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <p className="text-gray-800 font-medium">
          &ldquo;What unexpected blessing did you notice today?&rdquo;
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Start the conversation with your family tonight
        </p>
      </div>
      
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
        Set Reminder for Tonight
      </button>
    </div>
  )
}

function LegacyMomentCard() {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-medium text-gray-900">This Moment Matters</h3>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4 mb-4">
        <p className="text-gray-800 font-medium">
          &ldquo;Today I&apos;m grateful for...&rdquo;
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Add to your family&apos;s story for One Day
        </p>
      </div>
      
      <Link
        href="/vault"
        className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
      >
        Add to For One Day
      </Link>
    </div>
  )
}