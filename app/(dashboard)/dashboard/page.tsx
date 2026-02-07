import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { getBibleReadingAssignment } from '@/lib/bible-reading-plan'
import { getTodaysReflectionVerse } from '@/lib/reflection-verse'
import { UnifiedDailyPracticeV2 } from '@/components/dashboard/unified-daily-practice-v2'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { LegacyNotePrompt } from '@/components/dashboard/legacy-note-prompt'

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

  // Get progress - sequential system: always show next day after highest completed
  const { data: allEntries } = await supabase
    .from('daily_reflections')
    .select('day_number')
    .eq('user_id', user.id)
    .not('day_number', 'is', null)

  const completedDays = allEntries?.map(e => e.day_number).filter(Boolean) as number[] || []
  const highestCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0
  
  // Sequential: Always show the next day after your highest completed day
  // This allows you to catch up on missed days instead of skipping ahead
  const nextDayNumber = Math.min(highestCompletedDay + 1, 730)
  const today = getBibleReadingAssignment(nextDayNumber)
  
  const progress = {
    currentDay: nextDayNumber,
    totalDays: 730,
    percentage: Math.round((nextDayNumber / 730) * 100),
    currentBook: today.book,
    currentChapter: today.chapter,
    daysRemaining: Math.max(0, 730 - nextDayNumber)
  }

  // Check if this day is already completed
  const todayDate = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('daily_reflections')
    .select('id, media_urls, quick_note, day_number, reflection')
    .eq('user_id', user.id)
    .eq('day_number', nextDayNumber)
    .maybeSingle()

  const turnThePageCompleted = !!todayEntry && todayEntry.day_number === nextDayNumber

  // Get today's verse for reflection (tied to Turn the Page reading)
  const dailyVerse = getTodaysReflectionVerse()

  // Check if reflection is completed
  const reflectionCompleted = !!(todayEntry?.reflection && todayEntry.reflection.trim().length > 0)

  // Get reflection form data (images, turn the page photo, etc.)
  let mediaUrls: Array<{ url: string; storage_path: string }> = []
  let turnThePagePhoto: { url: string; storage_path: string } | null = null
  
  if (todayEntry?.media_urls && todayEntry.media_urls.length > 0) {
    const signedUrlPromises = todayEntry.media_urls.map(async (storagePath: string) => {
      const { data } = await supabase.storage
        .from('media')
        .createSignedUrl(storagePath, 3600)
      
      return {
        url: data?.signedUrl || '',
        storage_path: storagePath
      }
    })
    
    const signedUrls = await Promise.all(signedUrlPromises)
    mediaUrls = signedUrls.filter(item => item.url)
    
    if (todayEntry.day_number && mediaUrls.length > 0) {
      turnThePagePhoto = mediaUrls[0]
    }
  }

  const readingContext = `You just read ${today.book} ${today.chapter}. `

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

      {/* Unified Daily Practice - Clean Single-Page Flow */}
      <ScrollReveal delay={100}>
        <UnifiedDailyPracticeV2
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
              reference: dailyVerse.reference,
              theme: dailyVerse.theme
            },
            prompt: dailyVerse.prompt,
            isCompleted: reflectionCompleted
          }}
          reflectionForm={{
            initialReflection: todayEntry?.reflection || '',
            initialImages: mediaUrls,
            turnThePagePhoto,
            readingContext
          }}
          isPro={profile?.plan === 'pro' || profile?.plan === 'lifetime'}
        />
      </ScrollReveal>

      {/* Legacy Note Prompt - Connects Daily Practice to Legacy */}
      <ScrollReveal delay={200}>
        <LegacyNotePrompt userId={user.id} />
      </ScrollReveal>

      {/* Dynamic Stats - Connected to Supabase */}
      <ScrollReveal delay={300}>
        <DynamicStats userId={user.id} />
      </ScrollReveal>
    </div>
  )
}