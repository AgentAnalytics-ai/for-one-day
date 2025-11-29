import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionForm } from '@/components/reflection/reflection-form'
import { MemoryCard } from '@/components/reflection/memory-card'
import { WeeklyReviewCard } from '@/components/reflection/weekly-review-card'
import { getTodaysVerse } from '@/lib/daily-verses'
import Image from 'next/image'

/**
 * 📖 Daily Reflection Page
 * Server component for stability
 */
export default async function ReflectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Get today's reflection if it exists
  const { data: existingReflection } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Get today's verse (rotates daily based on day of year)
  const dailyVerse = getTodaysVerse()

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
    completed: true,
    userReflection: existingReflection.reflection,
    mediaUrls: mediaUrls
  } : {
    day: new Date().getDay(),
    date: today,
    verse: dailyVerse,
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

      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-blue-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
            God is inviting you to...
          </h2>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
            <p className="text-lg text-blue-600 font-medium mb-3">
              {reflectionData.verse.reference}
            </p>
            <p className="text-lg text-gray-700 italic mb-4">
              &ldquo;{reflectionData.verse.text}&rdquo;
            </p>
            <p className="text-lg text-gray-800 font-medium">
              {reflectionData.verse.prompt}
            </p>
            <p className="text-xs text-gray-500 mt-3 capitalize">
              Theme: {reflectionData.verse.theme}
            </p>
          </div>

          {reflectionData.completed ? (
            <div className="bg-green-50 p-6 rounded-xl mb-6 border border-green-200">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium text-lg">Reflection completed!</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100 mb-4">
                <p className="text-gray-800 italic">&ldquo;{reflectionData.userReflection}&rdquo;</p>
              </div>
              
              {/* Display Images */}
              {reflectionData.mediaUrls && reflectionData.mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                  {reflectionData.mediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Reflection image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ReflectionForm />
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