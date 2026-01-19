'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target } from 'lucide-react'

interface EnhancedBibleProgressProps {
  progress: {
    currentDay: number
    totalDays: number
    percentage: number
    currentBook: string
    currentChapter: number
    daysRemaining: number
  }
  completedDays: number[]
  onCompleteMultiple?: (days: number[]) => void
}

/**
 * 📊 Enhanced Bible Progress Visualization
 * Shows progress, streak, and smart completion tracking
 */
export function EnhancedBibleProgress({ 
  progress, 
  completedDays,
  onCompleteMultiple 
}: EnhancedBibleProgressProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [daysAhead, setDaysAhead] = useState(0)

  // Calculate if user is ahead of schedule
  useEffect(() => {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const daysSinceStart = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const expectedDay = Math.min(daysSinceStart, progress.totalDays)
    
    if (progress.currentDay > expectedDay) {
      setDaysAhead(progress.currentDay - expectedDay)
    } else {
      setDaysAhead(0)
    }
  }, [progress.currentDay, progress.totalDays])

  // Animate progress bar
  useEffect(() => {
    const duration = 1000 // 1 second
    const steps = 60
    const increment = progress.percentage / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= progress.percentage) {
        setAnimatedPercentage(progress.percentage)
        clearInterval(timer)
      } else {
        setAnimatedPercentage(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [progress.percentage])

  // Calculate estimated completion date
  const calculateCompletionDate = () => {
    if (daysAhead > 0) {
      // User is ahead - completion date is earlier
      const daysToComplete = progress.daysRemaining
      const completionDate = new Date()
      completionDate.setDate(completionDate.getDate() + daysToComplete)
      return completionDate
    } else {
      // On schedule or behind
      const daysToComplete = progress.daysRemaining
      const completionDate = new Date()
      completionDate.setDate(completionDate.getDate() + daysToComplete)
      return completionDate
    }
  }

  const completionDate = calculateCompletionDate()
  const formattedDate = completionDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })

  return (
    <div className="space-y-4">
      {/* Main Progress Bar */}
      <div className="relative">
        <div className="h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-300/50">
          <div
            className="h-full bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 transition-all duration-1000 ease-out relative shadow-md"
            style={{ width: `${animatedPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(animatedPercentage)}% Complete
          </span>
          {daysAhead > 0 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {daysAhead} day{daysAhead > 1 ? 's' : ''} ahead!
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Days Done</span>
          </div>
          <div className="text-3xl font-bold text-primary-900">{progress.currentDay}</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Days Left</span>
          </div>
          <div className="text-3xl font-bold text-primary-900">{progress.daysRemaining}</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total</span>
          </div>
          <div className="text-3xl font-bold text-primary-900">{progress.totalDays}</div>
        </div>
      </div>

      {/* Completion Estimate */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border-2 border-primary-200 shadow-sm">
        <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Estimated Completion</p>
        <p className="text-base font-bold text-primary-900">
          {formattedDate}
          {daysAhead > 0 && (
            <span className="ml-2 text-secondary-600 text-sm font-semibold">
              (Early by {daysAhead} day{daysAhead > 1 ? 's' : ''}!)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
