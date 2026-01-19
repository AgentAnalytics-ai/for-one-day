'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, PenTool, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { QuickBiblePhoto } from './quick-bible-photo'
import { EnhancedBibleProgress } from './enhanced-bible-progress'

interface UnifiedDailyPracticeProps {
  // Turn the Page data
  turnThePage: {
    dayNumber: number
    book: string
    chapter: number
    progress: {
      currentDay: number
      totalDays: number
      percentage: number
      currentBook: string
      currentChapter: number
      daysRemaining: number
    }
    completedDays: number[]
    isCompleted: boolean
  }
  // Reflection data
  reflection: {
    verse: {
      text: string
      reference: string
    }
    prompt: string
    isCompleted: boolean
  }
}

/**
 * 🎯 Unified Daily Practice Component
 * Expert UX: Makes Turn the Page and Reflection feel like ONE flow
 * Progressive disclosure: Complete Step 1 → Step 2 becomes primary
 */
export function UnifiedDailyPractice({ turnThePage, reflection }: UnifiedDailyPracticeProps) {
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(turnThePage.isCompleted)

  // When Turn the Page completes, show reflection suggestion
  const handleTurnThePageComplete = () => {
    setShowReflectionPrompt(true)
  }

  return (
    <div className="space-y-6">
      {/* Header: Your Daily Practice */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full mb-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">Your Daily Practice</span>
        </div>
        <p className="text-sm text-gray-600">
          {turnThePage.isCompleted 
            ? "Step 2 of 2: Reflect on what you read"
            : "Step 1 of 2: Read and capture your Bible page"
          }
        </p>
      </div>

      {/* Step 1: Turn the Page Challenge */}
      <div className={`transition-all duration-500 ${
        turnThePage.isCompleted 
          ? 'opacity-75 scale-98' // Diminished when complete
          : 'opacity-100 scale-100' // Primary when not complete
      }`}>
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                turnThePage.isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {turnThePage.isCompleted ? '✓' : '1'}
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Turn the Page Challenge
              </h3>
            </div>
            {turnThePage.isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete</span>
              </div>
            )}
          </div>

          {!turnThePage.isCompleted ? (
            <div className="space-y-4">
              <EnhancedBibleProgress 
                progress={turnThePage.progress} 
                completedDays={turnThePage.completedDays}
              />
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-3">
                  <span className="text-sm font-semibold text-purple-700">
                    Day {turnThePage.dayNumber}
                  </span>
                </div>
                <h4 className="text-xl font-serif font-medium text-gray-900 mb-1">
                  {turnThePage.book} {turnThePage.chapter}
                </h4>
                <p className="text-sm text-gray-600">
                  Read this chapter in your Bible, then take a photo
                </p>
              </div>
              <QuickBiblePhoto
                dayNumber={turnThePage.dayNumber}
                book={turnThePage.book}
                chapter={turnThePage.chapter}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <EnhancedBibleProgress 
                progress={turnThePage.progress} 
                completedDays={turnThePage.completedDays}
              />
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  Day {turnThePage.dayNumber} Complete! 🎉
                </h4>
                <p className="text-sm text-green-700">
                  You've read {turnThePage.book} {turnThePage.chapter}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Reflection - Becomes Primary After Turn the Page Complete */}
      <div className={`transition-all duration-500 ${
        turnThePage.isCompleted
          ? 'opacity-100 scale-100' // Primary when Turn the Page complete
          : 'opacity-60 scale-98' // Secondary when Turn the Page not complete
      }`}>
        <div className={`rounded-2xl p-6 md:p-8 border-2 shadow-lg ${
          turnThePage.isCompleted
            ? 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-blue-500' // Prominent when ready
            : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300' // Dimmed when not ready
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                turnThePage.isCompleted
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <h3 className={`text-xl font-serif font-medium ${
                turnThePage.isCompleted ? 'text-white' : 'text-gray-600'
              }`}>
                Today's Reflection
              </h3>
            </div>
            {reflection.isCompleted && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                turnThePage.isCompleted
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete</span>
              </div>
            )}
          </div>

          {!turnThePage.isCompleted ? (
            // Show preview when Turn the Page not complete
            <div className="text-center space-y-4">
              <div className={`rounded-xl p-4 mb-3 ${
                turnThePage.isCompleted
                  ? 'bg-white/95 backdrop-blur-md border border-white/50'
                  : 'bg-white/60 backdrop-blur border border-gray-300'
              }`}>
                <p className={`text-sm italic mb-2 leading-relaxed ${
                  turnThePage.isCompleted ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  &ldquo;{reflection.verse.text}&rdquo;
                </p>
                <p className={`text-xs font-medium ${
                  turnThePage.isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {reflection.verse.reference}
                </p>
              </div>
              <p className={`text-sm leading-relaxed ${
                turnThePage.isCompleted ? 'text-white' : 'text-gray-500'
              }`}>
                Complete your reading first to reflect
              </p>
            </div>
          ) : (
            // Show full reflection when Turn the Page complete
            <div className="space-y-4">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 mb-3 border border-white/50 shadow-2xl">
                <p className="text-sm sm:text-base text-gray-800 italic mb-2 leading-relaxed">
                  &ldquo;{reflection.verse.text}&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {reflection.verse.reference}
                </p>
              </div>
              
              <p className="text-sm sm:text-base text-white leading-relaxed drop-shadow-lg font-light">
                {reflection.prompt}
              </p>

              {/* Smart Contextual Suggestion */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <p className="text-sm text-white/90 mb-3">
                  💡 You just read <strong>{turnThePage.book} {turnThePage.chapter}</strong>. 
                  Want to reflect on what you learned?
                </p>
                <Link
                  href="/reflection"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 w-full justify-center"
                >
                  <PenTool className="w-5 h-5" />
                  <span>Start Your Reflection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {turnThePage.isCompleted ? '✅' : '📖'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {turnThePage.isCompleted ? 'Reading Done' : 'Reading Pending'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {reflection.isCompleted ? '✅' : '✍️'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {reflection.isCompleted ? 'Reflection Done' : 'Reflection Pending'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
