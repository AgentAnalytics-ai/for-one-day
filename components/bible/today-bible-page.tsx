import { getTodaysBibleReading } from '@/lib/bible-reading-plan'
import { SmoothTurnThePage } from './smooth-turn-the-page'
import { createClient } from '@/lib/supabase/server'

/**
 * 📖 Today's Bible Page Card
 * Primary feature on dashboard - shows today's assignment + camera button
 */
export async function TodayBiblePage({ userId }: { userId: string }) {
  const supabase = await createClient()
  const today = getTodaysBibleReading()
  
  // Check if today's entry exists
  const todayDate = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('daily_reflections')
    .select('id, media_urls, quick_note')
    .eq('user_id', userId)
    .eq('date', todayDate)
    .single()

  // Get progress - use highest completed day, not just today
  const { data: allEntries } = await supabase
    .from('daily_reflections')
    .select('day_number')
    .eq('user_id', userId)
    .not('day_number', 'is', null)

  const completedDays = allEntries?.map(e => e.day_number).filter(Boolean) as number[] || []
  const highestCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0
  
  // Calculate progress based on highest completed day (smart progress)
  // If user is ahead, use their highest day; otherwise use today's expected day
  const currentDay = Math.max(highestCompletedDay, today.dayNumber)
  const totalDays = 730
  const percentage = Math.round((currentDay / totalDays) * 100)
  const daysRemaining = Math.max(0, totalDays - currentDay)
  
  const progress = {
    currentDay,
    totalDays,
    percentage,
    currentBook: today.book,
    currentChapter: today.chapter,
    daysRemaining
  }

  const isCompleted = !!todayEntry

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-100 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-3">
          <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-2">
          Turn the Page Challenge
        </h2>
        
        <div className="text-lg md:text-xl text-gray-700 font-medium">
          Day {today.dayNumber}: {today.book} {today.chapter}
        </div>
        
        {isCompleted && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completed Today
          </div>
        )}
      </div>

      {/* Smooth Turn the Page Experience */}
      <SmoothTurnThePage
        dayNumber={today.dayNumber}
        book={today.book}
        chapter={today.chapter}
        progress={progress}
        completedDays={completedDays}
        isCompleted={isCompleted}
      />
    </div>
  )
}
