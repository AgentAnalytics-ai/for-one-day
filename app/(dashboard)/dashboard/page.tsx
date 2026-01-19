import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { getTodaysVerse } from '@/lib/daily-verses'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { TodayBiblePage } from '@/components/bible/today-bible-page'

/**
 * 🏠 Dashboard - Turn the Page Challenge (Primary) + Reflections (Secondary)
 * Clean, focused experience with Bible reading as main feature
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile for subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  // Get today's verse
  const dailyVerse = getTodaysVerse()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Welcome */}
      <div className="text-center">
        <TimeGreeting />
        <SubscriptionBadge tier={profile?.plan || 'free'} />
        {(!profile || profile.plan === 'free') && (
          <div className="mt-4">
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>

      {/* PRIMARY: Turn the Page Challenge */}
      <TodayBiblePage userId={user.id} />

      {/* SECONDARY: Daily Reflection (Existing Feature) */}
      <div 
        className="relative min-h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
      >
        <div className="relative z-10 flex flex-col justify-center h-full py-6 px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur rounded-full mb-2 shadow-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-white drop-shadow-lg">
              Today&apos;s Reflection
            </h2>
            
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 mb-3 border border-white/50 shadow-2xl">
              <p className="text-sm sm:text-base text-gray-800 italic mb-2 leading-relaxed">
                &ldquo;{dailyVerse.text}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">{dailyVerse.reference}</p>
            </div>
            
            <p className="text-sm sm:text-base text-white leading-relaxed drop-shadow-lg font-light">
              {dailyVerse.prompt}
            </p>
            
            <Link
              href="/reflection"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Start Your Reflection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Stats - Connected to Supabase */}
      <DynamicStats userId={user.id} />
    </div>
  )
}