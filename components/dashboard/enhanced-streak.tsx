import { createClient } from '@/lib/supabase/server'
import { Flame, Trophy, Calendar } from 'lucide-react'

interface EnhancedStreakProps {
  userId: string
}

/**
 * 🔥 Enhanced Streak Display - Duolingo Style
 * Gamified streak tracking with progress bars and milestone celebrations
 * Meta-level polish with smooth animations
 */
export async function EnhancedStreak({ userId }: EnhancedStreakProps) {
  const supabase = await createClient()

  // Get all reflections
  const { data: reflections } = await supabase
    .from('daily_reflections')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  // Calculate streak
  let reflectionStreak = 0
  let streakDates: string[] = []
  
  if (reflections && reflections.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get last 30 days for calendar view
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    // Build map of reflection dates
    const reflectionDates = new Set(reflections.map(r => r.date))

    // Calculate streak (consecutive days including today)
    for (let i = 0; i < last30Days.length; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      if (reflectionDates.has(dateStr)) {
        reflectionStreak++
        streakDates.push(dateStr)
      } else {
        break // Streak broken
      }
    }

    // Build calendar grid for last 30 days
    streakDates = last30Days.filter(date => reflectionDates.has(date))
  }

  // Milestone badges
  const milestones = [7, 14, 30, 60, 100, 365]
  const nextMilestone = milestones.find(m => m > reflectionStreak) || null
  const achievedMilestones = milestones.filter(m => m <= reflectionStreak)
  const progressToNext = nextMilestone 
    ? Math.min((reflectionStreak / nextMilestone) * 100, 100)
    : 100

  // Get streak message
  const getStreakMessage = () => {
    if (reflectionStreak === 0) return 'Start your reflection streak today!'
    if (reflectionStreak === 1) return 'Great start! Keep it going!'
    if (reflectionStreak < 7) return `${7 - reflectionStreak} more days to your first milestone!`
    if (reflectionStreak < 30) return 'You\'re building an amazing habit!'
    if (reflectionStreak < 100) return 'Incredible consistency! Keep it up!'
    return 'You\'re a reflection master!'
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 rounded-2xl p-5 md:p-6 border-2 border-orange-200 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
            ${reflectionStreak > 0 
              ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg animate-pulse' 
              : 'bg-gray-300'
            }
            transition-all duration-300
          `}>
            <Flame className={`w-6 h-6 md:w-7 md:h-7 ${reflectionStreak > 0 ? 'text-white' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
              {reflectionStreak} Day{reflectionStreak !== 1 ? 's' : ''} Streak!
            </h3>
            <p className="text-xs md:text-sm text-gray-600">{getStreakMessage()}</p>
          </div>
        </div>
        
        {/* Trophy for milestones */}
        {achievedMilestones.length > 0 && (
          <div className="flex items-center gap-1 bg-amber-100 rounded-full px-3 py-1.5">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">
              {achievedMilestones.length} Badge{achievedMilestones.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar to Next Milestone */}
      {nextMilestone && reflectionStreak > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700">
              {nextMilestone - reflectionStreak} days to {nextMilestone}-day badge
            </span>
            <span className="text-xs font-bold text-orange-600">
              {Math.round(progressToNext)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out shadow-inner"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* 30-Day Calendar Grid - Compact Duolingo Style */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Last 30 Days
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            const dateStr = date.toISOString().split('T')[0]
            const hasReflection = streakDates.includes(dateStr)
            const isToday = i === 29
            
            return (
              <div
                key={dateStr}
                className={`
                  aspect-square rounded-md flex items-center justify-center
                  transition-all duration-200
                  ${hasReflection
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-sm'
                    : 'bg-gray-200'
                  }
                  ${isToday && hasReflection 
                    ? 'ring-1 ring-orange-400' 
                    : ''
                  }
                  ${isToday && !hasReflection
                    ? 'ring-1 ring-gray-400 border border-dashed border-gray-400'
                    : ''
                  }
                `}
                title={dateStr}
              >
                {hasReflection && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone Badges */}
      {achievedMilestones.length > 0 && (
        <div className="pt-6 border-t border-orange-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Achieved Milestones</h4>
          <div className="flex flex-wrap gap-2">
            {achievedMilestones.map(milestone => (
              <div
                key={milestone}
                className="flex items-center gap-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg px-3 py-2 border border-amber-300"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">{milestone} Days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Message */}
      {reflectionStreak === 0 && (
        <div className="text-center pt-4">
          <p className="text-gray-600 text-sm mb-2">Reflect today to start your streak!</p>
          <a
            href="/reflection"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
          >
            Write Your Reflection
            <Flame className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}

