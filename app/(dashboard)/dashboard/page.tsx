import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { getTodaysVerse } from '@/lib/daily-verses'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { getTodaysBibleReading } from '@/lib/bible-reading-plan'
import { UnifiedDailyPractice } from '@/components/bible/unified-daily-practice'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

/**
 * 🎯 Unified Dashboard - Expert UX Flow
 * Makes Turn the Page and Reflection feel like ONE spiritual practice
 * Progressive disclosure: Complete Step 1 → Step 2 becomes primary
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

  // Get today's Bible reading
  const today = getTodaysBibleReading()
  const todayDate = new Date().toISOString().split('T')[0]

  // Check Turn the Page status
  const { data: todayEntry } = await supabase
    .from('daily_reflections')
    .select('id, media_urls, quick_note, day_number, reflection')
    .eq('user_id', user.id)
    .eq('date', todayDate)
    .maybeSingle()

  // Get progress
  const { data: allEntries } = await supabase
    .from('daily_reflections')
    .select('day_number')
    .eq('user_id', user.id)
    .not('day_number', 'is', null)

  const completedDays = allEntries?.map(e => e.day_number).filter(Boolean) as number[] || []
  const highestCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0
  const currentDay = Math.max(highestCompletedDay, today.dayNumber)
  
  const progress = {
    currentDay,
    totalDays: 730,
    percentage: Math.round((currentDay / 730) * 100),
    currentBook: today.book,
    currentChapter: today.chapter,
    daysRemaining: Math.max(0, 730 - currentDay)
  }

  const turnThePageCompleted = !!todayEntry && todayEntry.day_number === today.dayNumber

  // Get today's verse for reflection
  const dailyVerse = getTodaysVerse()

  // Check if reflection is completed
  const reflectionCompleted = !!(todayEntry?.reflection && todayEntry.reflection.trim().length > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Welcome */}
      <ScrollReveal>
        <div className="text-center">
          <TimeGreeting />
          <SubscriptionBadge tier={profile?.plan || 'free'} />
          {(!profile || profile.plan === 'free') && (
            <div className="mt-4">
              <Link
                href="/upgrade"
                aria-label="Upgrade to Pro plan"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Unified Daily Practice - ONE FLOW */}
      <ScrollReveal delay={100}>
        <UnifiedDailyPractice
        turnThePage={{
          dayNumber: today.dayNumber,
          book: today.book,
          chapter: today.chapter,
          progress,
          completedDays,
          isCompleted: turnThePageCompleted
        }}
        reflection={{
          verse: {
            text: dailyVerse.text,
            reference: dailyVerse.reference
          },
          prompt: dailyVerse.prompt,
          isCompleted: reflectionCompleted
        }}
        />
      </ScrollReveal>

      {/* Dynamic Stats - Connected to Supabase */}
      <ScrollReveal delay={200}>
        <DynamicStats userId={user.id} />
      </ScrollReveal>
    </div>
  )
}