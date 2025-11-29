import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { getTodaysVerse } from '@/lib/daily-verses'
import { TimeGreeting } from '@/components/dashboard/time-greeting'

/**
 * 🏠 Dashboard - Today's Invitation
 * Emotional, not functional. Sacred space for reflection and documentation.
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

      {/* Today's Invitation - Hero with Photo Background */}
      <div 
        className="relative min-h-[380px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
      >
        
        <div className="relative z-10 flex flex-col justify-center h-full py-6 sm:py-8 px-4 sm:px-6 md:px-8">
          {/* Content section - More compact */}
          <div className="text-center max-w-2xl mx-auto space-y-4 sm:space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur rounded-full mb-2 sm:mb-3 shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-3xl font-serif font-medium text-white drop-shadow-lg px-2">
              Today&apos;s Reflection
            </h2>
            
            <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 border border-white/50 shadow-2xl mx-2">
              <p className="text-sm sm:text-base md:text-lg text-gray-800 italic mb-2 leading-relaxed">
                &ldquo;{dailyVerse.text}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">{dailyVerse.reference}</p>
            </div>
            
            <p className="text-base sm:text-lg md:text-lg text-white leading-relaxed drop-shadow-lg font-light px-2 mb-4 sm:mb-5">
              {dailyVerse.prompt}
            </p>
            
            {/* CTA button - Inline with content */}
            <Link
              href="/reflection"
              className="inline-flex items-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="whitespace-nowrap">Start Your Reflection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Stats - Connected to Supabase */}
      <DynamicStats userId={user.id} />
    </div>
  )
}