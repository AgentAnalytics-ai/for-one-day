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
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 transition-all duration-1000 ease-out relative"
            style={{ width: `${animatedPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(animatedPercentage)}% Complete
          </span>
          {daysAhead > 0 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              🎉 {daysAhead} day{daysAhead > 1 ? 's' : ''} ahead!
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">Days Done</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress.currentDay}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-gray-600">Days Left</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress.daysRemaining}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress.totalDays}</div>
        </div>
      </div>

      {/* Completion Estimate */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
        <p className="text-xs text-gray-600 mb-1">Estimated Completion</p>
        <p className="text-sm font-semibold text-gray-900">
          {formattedDate}
          {daysAhead > 0 && (
            <span className="ml-2 text-green-600 text-xs">
              (Early by {daysAhead} day{daysAhead > 1 ? 's' : ''}!)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
