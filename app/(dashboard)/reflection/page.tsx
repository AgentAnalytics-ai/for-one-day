import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionForm } from '@/components/reflection/reflection-form'
import { MemoryCard } from '@/components/reflection/memory-card'
import { WeeklyReviewCard } from '@/components/reflection/weekly-review-card'
import { getStylePrompt, getStyleContext, type ReflectionStyle } from '@/lib/reflection-styles'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'
import { EnhancedVerseDisplay } from '@/components/reflection/enhanced-verse-display'
import Image from 'next/image'
import { EditButton } from '@/components/reflection/edit-button'
import { ReflectionImages } from '@/components/reflection/reflection-images'
import { TurnThePageChallenge } from '@/components/reflection/turn-the-page-challenge'
import { SaveAsLegacyNote } from '@/components/reflection/save-as-legacy-note'
import { getBibleReadingAssignment } from '@/lib/bible-reading-plan'
import { getReflectionVerseForReading } from '@/lib/reflection-verse'

/**
 * 📖 Daily Reflection Page
 * Server component for stability
 */
export default async function ReflectionPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get search params (Next.js 15 makes this a Promise)
  const params = await searchParams
  const isEditMode = params?.edit === 'true'

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Get today's reflection if it exists
  const { data: existingReflection } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Get user's subscription status
  const subscription = await getUserSubscriptionStatus(user.id)
  const isPro = subscription.plan === 'pro' || subscription.plan === 'lifetime'

  // Get user's reflection style preference
  const { data: profile } = await supabase
    .from('profiles')
    .select('reflection_style')
    .eq('user_id', user.id)
    .single()

  const reflectionStyle: ReflectionStyle = (profile?.reflection_style as ReflectionStyle) || 'auto'

  // Get sequential reading (next day after highest completed)
  const { data: allEntries } = await supabase
    .from('daily_reflections')
    .select('day_number')
    .eq('user_id', user.id)
    .not('day_number', 'is', null)

  const completedDays = allEntries?.map(e => e.day_number).filter(Boolean) as number[] || []
  const highestCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0
  const nextDayNumber = Math.min(highestCompletedDay + 1, 730)
  
  // Get reading assignment for the sequential day
  const todayReading = getBibleReadingAssignment(nextDayNumber)
  
  // Get verse tied to this reading
  const dailyVerse = getReflectionVerseForReading(todayReading)

  // Get style-specific prompt (stays Christian, just different approach)
  const stylePrompt = getStylePrompt(dailyVerse, reflectionStyle)
  const styleContext = getStyleContext(dailyVerse, reflectionStyle)

  const readingContext = `You just read ${todayReading.book} ${todayReading.chapter}. `

  // Generate signed URLs for media attachments if they exist
  let mediaUrls: Array<{ url: string; storage_path: string }> = []
  let turnThePagePhoto: { url: string; storage_path: string } | null = null
  
  if (existingReflection?.media_urls && existingReflection.media_urls.length > 0) {
    const signedUrlPromises = existingReflection.media_urls.map(async (storagePath: string) => {
      // All reflection images (including Turn the Page photos) are stored in 'media' bucket
      const { data } = await supabase.storage
        .from('media')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry
      
      return {
        url: data?.signedUrl || '',
        storage_path: storagePath
      }
    })
    
    const signedUrls = await Promise.all(signedUrlPromises)
    mediaUrls = signedUrls.filter(item => item.url)
    
    // If there's a photo and it's from Turn the Page (has day_number), use it as Turn the Page photo
    if (existingReflection.day_number && mediaUrls.length > 0) {
      turnThePagePhoto = mediaUrls[0]
    }
  }

  // Extract just URLs for ReflectionImages component (expects string[])
  const mediaUrlStrings = mediaUrls.map(item => item.url).filter(Boolean)

  const reflectionData = existingReflection ? {
    day: new Date().getDay(),
    date: today,
    verse: dailyVerse,
    prompt: stylePrompt,
    context: styleContext,
    completed: true,
    userReflection: existingReflection.reflection,
    mediaUrls: mediaUrlStrings
  } : {
    day: new Date().getDay(),
    date: today,
    verse: dailyVerse,
    prompt: stylePrompt,
    context: styleContext,
    completed: false,
    userReflection: null,
    mediaUrls: []
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">
          Today&apos;s Reflection
        </h1>
        <p className="text-lg text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl sm:rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 shadow-md">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
            Today&apos;s Reflection Prompt
          </h2>
          
          {/* Enhanced Verse Display (Pro) or Basic (Free) */}
          <EnhancedVerseDisplay
            verse={reflectionData.verse}
            isPro={isPro}
            defaultPrompt={reflectionData.prompt}
          />
          
          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              Debug: isPro={isPro ? 'true' : 'false'}, plan={subscription.plan}
            </div>
          )}

          {reflectionData.completed && !isEditMode ? (
            <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-300 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium text-lg">Reflection completed!</span>
                </div>
                <EditButton />
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100 mb-4">
                <p className="text-gray-800 italic">&ldquo;{reflectionData.userReflection}&rdquo;</p>
              </div>
              
              {/* Display Images */}
              {reflectionData.mediaUrls && reflectionData.mediaUrls.length > 0 && (
                <ReflectionImages images={reflectionData.mediaUrls} />
              )}

              {/* Turn the Page Challenge - AI Insights (Pro only) */}
              {isPro && existingReflection?.turn_the_page_insights && (
                <TurnThePageChallenge insights={existingReflection.turn_the_page_insights} />
              )}

              {/* Save as Legacy Note */}
              {existingReflection && (
                <SaveAsLegacyNote
                  reflectionId={existingReflection.id}
                  reflectionText={reflectionData.userReflection || ''}
                  reflectionDate={reflectionData.date}
                />
              )}
            </div>
          ) : (
            <ReflectionForm 
              initialReflection={reflectionData.userReflection || ''}
              initialImages={mediaUrls}
              turnThePagePhoto={turnThePagePhoto}
              readingContext={readingContext}
            />
          )}
        </div>
      </div>

      {/* Weekly Review Card - Instagram Stories Style */}
      <div className="mt-8">
        <WeeklyReviewCard userId={user.id} />
      </div>

      {/* This Time Last Year Card */}
      <div className="mt-8">
        <MemoryCard targetDate={today} />
      </div>
    </div>
  )
}