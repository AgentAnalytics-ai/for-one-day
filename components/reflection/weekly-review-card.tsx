'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ChevronRight, ImageIcon } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

interface WeeklyReflection {
  date: string
  reflection: string
  media_urls?: string[]
}

interface WeeklyReviewCardProps {
  userId: string
}

/**
 * 📅 Weekly Review Card - Instagram Stories Style
 * Horizontal scrolling cards showing last 7 days of reflections
 * Meta-level polish with smooth animations
 */
export function WeeklyReviewCard({ userId }: WeeklyReviewCardProps) {
  const [reflections, setReflections] = useState<WeeklyReflection[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string[]>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchWeeklyReflections() {
      try {
        const response = await fetch(`/api/reflection/weekly?userId=${userId}`)
        const data = await response.json()

        if (data.success && data.reflections) {
          setReflections(data.reflections)
          
          // Generate signed URLs for images
          if (data.signedUrls) {
            setMediaUrls(data.signedUrls)
          }
        }
      } catch (error) {
        console.error('Error fetching weekly reflections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyReflections()
  }, [userId])

  // Generate array of last 7 days (including today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const getDayLabel = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEE') // Mon, Tue, etc.
  }

  const getDayNumber = (dateString: string) => {
    return format(parseISO(dateString), 'd')
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const hasReflections = reflections.length > 0

  if (!hasReflections) {
    return null // Don't show if no reflections
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-semibold text-gray-900">Your Week</h3>
            <p className="text-sm text-gray-600">Last 7 days of reflections</p>
          </div>
        </div>
        <Link
          href="/reflections/history"
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scrolling Cards - Instagram Stories Style */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {last7Days.map((dateString, index) => {
          const reflection = reflections.find(r => r.date === dateString)
          const hasReflection = !!reflection
          const images = reflection && mediaUrls[reflection.date] ? mediaUrls[reflection.date] : []
          const dayLabel = getDayLabel(dateString)
          const dayNumber = getDayNumber(dateString)
          
          return (
            <div
              key={dateString}
              className={`
                flex-shrink-0 w-32 md:w-40 snap-center
                transition-all duration-300 hover:scale-105
                ${hasReflection ? 'cursor-pointer' : 'opacity-50'}
              `}
            >
              <Link
                href={hasReflection ? `/reflections/history?date=${dateString}` : '/reflection'}
                className="block"
              >
                {/* Story Card - Instagram Style */}
                <div
                  className={`
                    relative aspect-[9/16] rounded-2xl overflow-hidden
                    shadow-lg border-2 transition-all duration-300
                    ${hasReflection 
                      ? 'border-purple-300 bg-gradient-to-br from-purple-100 to-pink-100' 
                      : 'border-gray-200 bg-gray-50'
                    }
                    ${hasReflection ? 'hover:border-purple-400 hover:shadow-xl' : ''}
                  `}
                >
                  {/* Background Image or Gradient */}
                  {images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={images[0]}
                        alt={`Reflection from ${dayLabel}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Image Count Badge */}
                      {images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-medium">{images.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`
                      w-full h-full flex flex-col items-center justify-center
                      ${hasReflection ? 'bg-gradient-to-br from-purple-200 to-pink-200' : 'bg-gray-100'}
                    `}>
                      {hasReflection ? (
                        <div className="text-center px-3">
                          <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Calendar className="w-6 h-6 mx-auto mb-1" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date Badge - Top */}
                  <div className={`
                    absolute top-3 left-3
                    ${hasReflection 
                      ? 'bg-black/50 backdrop-blur-sm' 
                      : 'bg-gray-400/50 backdrop-blur-sm'
                    }
                    rounded-full px-3 py-1.5
                  `}>
                    <div className="flex flex-col items-center">
                      <span className={`
                        text-xs font-medium
                        ${hasReflection ? 'text-white' : 'text-gray-700'}
                      `}>
                        {dayLabel}
                      </span>
                      <span className={`
                        text-lg font-bold
                        ${hasReflection ? 'text-white' : 'text-gray-700'}
                      `}>
                        {dayNumber}
                      </span>
                    </div>
                  </div>

                  {/* Checkmark Badge - Bottom */}
                  {hasReflection && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 rounded-full p-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Reflection Preview Text - Bottom */}
                  {hasReflection && reflection.reflection && (
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className={`
                        text-xs text-white font-medium line-clamp-2
                        ${images.length > 0 ? 'drop-shadow-lg' : ''}
                      `}>
                        {reflection.reflection}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Scroll Indicator */}
      {reflections.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">← Swipe to see more →</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-purple-200">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">{reflections.length}</p>
            <p className="text-xs text-gray-600">Reflections</p>
          </div>
          <div className="w-px h-8 bg-purple-200" />
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {Object.values(mediaUrls).flat().length}
            </p>
            <p className="text-xs text-gray-600">Photos</p>
          </div>
          <div className="w-px h-8 bg-purple-200" />
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {7 - reflections.length}
            </p>
            <p className="text-xs text-gray-600">Days Left</p>
          </div>
        </div>
      </div>
    </div>
  )
}

