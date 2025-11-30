import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionForm } from '@/components/reflection/reflection-form'
import { MemoryCard } from '@/components/reflection/memory-card'
import { WeeklyReviewCard } from '@/components/reflection/weekly-review-card'
import { getTodaysVerse } from '@/lib/daily-verses'
import { getStylePrompt, getStyleContext, type ReflectionStyle } from '@/lib/reflection-styles'
import Image from 'next/image'
import { EditButton } from '@/components/reflection/edit-button'
import { ReflectionImages } from '@/components/reflection/reflection-images'

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

  // Get user's reflection style preference
  const { data: profile } = await supabase
    .from('profiles')
    .select('reflection_style')
    .eq('user_id', user.id)
    .single()

  const reflectionStyle: ReflectionStyle = (profile?.reflection_style as ReflectionStyle) || 'auto'

  // Get today's verse (rotates daily based on day of year)
  const dailyVerse = getTodaysVerse()

  // Get style-specific prompt (stays Christian, just different approach)
  const stylePrompt = getStylePrompt(dailyVerse, reflectionStyle)
  const styleContext = getStyleContext(dailyVerse, reflectionStyle)

  // Generate signed URLs for media attachments if they exist
  let mediaUrls: string[] = []
  if (existingReflection?.media_urls && existingReflection.media_urls.length > 0) {
    const signedUrlPromises = existingReflection.media_urls.map(async (storagePath: string) => {
      const { data } = await supabase.storage
        .from('media')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry
      return data?.signedUrl || null
    })
    
    const signedUrls = await Promise.all(signedUrlPromises)
    mediaUrls = signedUrls.filter((url): url is string => url !== null)
  }

  const reflectionData = existingReflection ? {
    day: new Date().getDay(),
    date: today,
    verse: dailyVerse,
    prompt: stylePrompt,
    context: styleContext,
    completed: true,
    userReflection: existingReflection.reflection,
    mediaUrls: mediaUrls
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
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
            <div className="mb-4">
              <p className="text-lg text-blue-600 font-medium mb-2">
                {reflectionData.verse.reference}
              </p>
              <p className="text-lg text-gray-700 italic mb-4">
                &ldquo;{reflectionData.verse.text}&rdquo;
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              {reflectionData.context && (
                <p className="text-sm text-gray-600 italic mb-3">
                  {reflectionData.context}
                </p>
              )}
              <p className="text-lg text-gray-800 font-medium mb-2">
                {reflectionData.prompt}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Theme: {reflectionData.verse.theme}
              </p>
            </div>
          </div>

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
            </div>
          ) : (
            <ReflectionForm 
              initialReflection={reflectionData.userReflection || ''}
              initialImages={existingReflection?.media_urls?.map((storagePath: string, index: number) => ({
                url: mediaUrls[index] || '',
                storage_path: storagePath
              })) || []}
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