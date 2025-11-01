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
  
  // Dynamic background based on time of day
  const timeBasedGradient = 
    timeOfDay < 12 
      ? 'from-amber-400 via-orange-300 to-rose-400' // Sunrise
      : timeOfDay < 17 
      ? 'from-sky-400 via-blue-300 to-cyan-400' // Daylight
      : timeOfDay < 22
      ? 'from-orange-500 via-pink-400 to-purple-500' // Sunset
      : 'from-indigo-900 via-purple-900 to-blue-900' // Night

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
        className="relative min-h-[600px] rounded-3xl overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(/family-infront-of-cross.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        
        <div className="relative z-10 flex flex-col justify-between h-full py-8 px-6 md:px-8">
          {/* Top section - Title and verse */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6 drop-shadow-lg">
              Today&apos;s Reflection
            </h2>
            
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 md:p-6 mb-6 border border-white/50 shadow-2xl">
              <p className="text-base md:text-lg text-gray-800 italic mb-3 leading-relaxed">
                &ldquo;Give thanks in all circumstances; for this is God&rsquo;s will for you in Christ Jesus.&rdquo;
              </p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">1 Thessalonians 5:18</p>
            </div>
            
            <p className="text-lg md:text-xl text-white leading-relaxed drop-shadow-lg font-light">
              What unexpected blessing did you notice today?
            </p>
          </div>
          
          {/* Bottom section - CTA button */}
          <div className="text-center max-w-2xl mx-auto mt-8">
            <Link
              href="/reflection"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Your Reflection
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Stats - Connected to Supabase */}
      <DynamicStats userId={user.id} />
    </div>
  )
}