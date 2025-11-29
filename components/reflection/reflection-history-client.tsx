'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, getDaysInMonth } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ImageIcon, Search } from 'lucide-react'

interface Reflection {
  date: string
  reflection: string
  media_urls?: string[]
}

interface ReflectionHistoryClientProps {
  initialReflections: Reflection[]
  userId: string
}

/**
 * 📅 Reflection History Client Component - Instagram Archive Style
 * Calendar grid with month navigation and reflection previews
 */
export function ReflectionHistoryClient({ initialReflections, userId }: ReflectionHistoryClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  // Build reflection map for quick lookup
  const reflectionMap = useMemo(() => {
    const map = new Map<string, Reflection>()
    reflections.forEach(r => map.set(r.date, r))
    return map
  }, [reflections])

  // Fetch signed URLs for selected month
  useEffect(() => {
    async function fetchMediaUrls() {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      
      const monthReflections = reflections.filter(r => {
        const date = parseISO(r.date)
        return date >= monthStart && date <= monthEnd
      })

      if (monthReflections.length === 0) return

      setLoading(true)
      try {
        const response = await fetch(`/api/reflection/history-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reflections: monthReflections.map(r => ({ date: r.date, media_urls: r.media_urls }))
          })
        })

        const data = await response.json()
        if (data.success && data.signedUrls) {
          setMediaUrls(prev => ({ ...prev, ...data.signedUrls }))
        }
      } catch (error) {
        console.error('Error fetching media URLs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMediaUrls()
  }, [currentMonth, reflections])

  // Filter reflections by search query
  const filteredReflections = useMemo(() => {
    if (!searchQuery.trim()) return reflections
    const query = searchQuery.toLowerCase()
    return reflections.filter(r => 
      r.reflection.toLowerCase().includes(query) ||
      format(parseISO(r.date), 'MMMM d, yyyy').toLowerCase().includes(query)
    )
  }, [reflections, searchQuery])

  // Calendar days for current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = getDaysInMonth(currentMonth)
  
  // Get first day of week for month start
  const firstDayOfWeek = monthStart.getDay()
  
  // Generate calendar grid (6 weeks × 7 days = 42 days)
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []
    
    // Previous month's days to fill first week
    const prevMonthEnd = new Date(monthStart)
    prevMonthEnd.setDate(0) // Last day of previous month
    const daysToAdd = firstDayOfWeek
    
    for (let i = daysToAdd - 1; i >= 0; i--) {
      const date = new Date(prevMonthEnd)
      date.setDate(prevMonthEnd.getDate() - i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth)
      date.setDate(day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month's days to fill last week (42 total days)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [currentMonth, monthStart, monthEnd, daysInMonth, firstDayOfWeek])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const getReflectionForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return reflectionMap.get(dateStr)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search reflections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Calendar Grid - Instagram Archive Style */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-serif font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const reflection = getReflectionForDate(date)
            const dateStr = format(date, 'yyyy-MM-dd')
            const images = reflection && mediaUrls[dateStr] ? mediaUrls[dateStr] : []
            const isSelected = selectedDate === dateStr
            const isToday = isSameDay(date, new Date())

            return (
              <Link
                key={`${dateStr}-${index}`}
                href={reflection ? `/reflections/history?date=${dateStr}` : '#'}
                onClick={(e) => {
                  if (!reflection) e.preventDefault()
                  setSelectedDate(dateStr)
                }}
                className={`
                  relative aspect-square rounded-lg overflow-hidden
                  transition-all duration-200 group
                  ${reflection 
                    ? 'cursor-pointer hover:scale-105 hover:shadow-lg' 
                    : 'cursor-default opacity-30'
                  }
                  ${isSelected && reflection ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                  ${isToday && !reflection ? 'ring-2 ring-gray-300' : ''}
                `}
              >
                {/* Day Number */}
                <div className={`
                  absolute top-1 left-1 z-10
                  ${reflection 
                    ? 'bg-black/50 backdrop-blur-sm text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                  rounded px-1.5 py-0.5 text-xs font-medium
                `}>
                  {format(date, 'd')}
                </div>

                {/* Reflection Image or Gradient */}
                {reflection ? (
                  <>
                    {images.length > 0 ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={images[0]}
                          alt={`Reflection from ${format(date, 'MMM d')}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        
                        {/* Image Count Badge */}
                        {images.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-white" />
                            <span className="text-xs text-white font-medium">{images.length}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Checkmark Badge */}
                    <div className="absolute bottom-1 left-1">
                      <div className="bg-green-500 rounded-full p-1 shadow-md">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {isToday && (
                      <div className="text-xs text-gray-400 font-medium">Today</div>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Selected Reflection Preview */}
      {selectedDate && reflectionMap.has(selectedDate) && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </h3>
          <p className="text-gray-700 italic mb-4">
            &ldquo;{reflectionMap.get(selectedDate)?.reflection}&rdquo;
          </p>
          {mediaUrls[selectedDate] && mediaUrls[selectedDate].length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {mediaUrls[selectedDate].slice(0, 3).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
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
      )}
    </div>
  )
}

