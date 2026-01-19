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
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full mb-3 shadow-sm border border-primary-200/50">
          <BookOpen className="w-5 h-5 text-primary-700" />
          <span className="font-semibold text-primary-900">Your Daily Practice</span>
        </div>
        <p className="text-sm text-gray-600 font-medium">
          {turnThePage.isCompleted 
            ? "Step 2 of 2: Reflect on what you read"
            : "Step 1 of 2: Read and capture your Bible page"
          }
        </p>
      </div>

      {/* Step 1: Turn the Page Challenge */}
      <div className={`transition-all duration-500 ease-out ${
        turnThePage.isCompleted 
          ? 'opacity-70 scale-[0.98]' // Diminished when complete
          : 'opacity-100 scale-100' // Primary when not complete
      }`}>
        <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 rounded-2xl p-6 md:p-8 border-2 border-primary-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm transition-all duration-300 ${
                turnThePage.isCompleted
                  ? 'bg-secondary-100 text-secondary-700 ring-2 ring-secondary-300'
                  : 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
              }`}>
                {turnThePage.isCompleted ? '✓' : '1'}
              </div>
              <h3 className="text-2xl font-serif font-semibold text-gray-900">
                Turn the Page Challenge
              </h3>
            </div>
            {turnThePage.isCompleted && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold shadow-sm ring-1 ring-secondary-300">
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
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-100 rounded-full mb-4 shadow-sm border border-primary-200/50">
                  <span className="text-sm font-bold text-primary-800">
                    Day {turnThePage.dayNumber}
                  </span>
                </div>
                <h4 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  {turnThePage.book} {turnThePage.chapter}
                </h4>
                <p className="text-sm text-gray-600 font-medium">
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
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-300 rounded-xl p-8 text-center shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-200 rounded-full mb-4 shadow-md">
                  <CheckCircle2 className="w-10 h-10 text-secondary-700" />
                </div>
                <h4 className="text-xl font-serif font-bold text-secondary-900 mb-2">
                  Day {turnThePage.dayNumber} Complete!
                </h4>
                <p className="text-sm text-secondary-700 font-medium">
                  You've read {turnThePage.book} {turnThePage.chapter}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Reflection - Becomes Primary After Turn the Page Complete */}
      <div className={`transition-all duration-500 ease-out ${
        turnThePage.isCompleted
          ? 'opacity-100 scale-100' // Primary when Turn the Page complete
          : 'opacity-50 scale-[0.98]' // Secondary when Turn the Page not complete
      }`}>
        <div className={`rounded-2xl p-6 md:p-8 border-2 shadow-lg transition-all duration-300 ${
          turnThePage.isCompleted
            ? 'bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 border-primary-600 shadow-2xl hover:shadow-3xl' // Prominent when ready
            : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300' // Dimmed when not ready
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm transition-all duration-300 ${
                turnThePage.isCompleted
                  ? 'bg-white/20 text-white ring-2 ring-white/30'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <h3 className={`text-2xl font-serif font-semibold ${
                turnThePage.isCompleted ? 'text-white' : 'text-gray-600'
              }`}>
                Today's Reflection
              </h3>
            </div>
            {reflection.isCompleted && (
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                turnThePage.isCompleted
                  ? 'bg-white/20 text-white ring-1 ring-white/30'
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
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg">
                <p className="text-sm text-white/95 mb-4 font-medium leading-relaxed">
                  You just read <strong className="font-bold">{turnThePage.book} {turnThePage.chapter}</strong>. 
                  Want to reflect on what you learned?
                </p>
                <Link
                  href="/reflection"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 w-full justify-center group"
                >
                  <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Start Your Reflection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {turnThePage.isCompleted ? 'Complete' : 'Pending'}
            </div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {turnThePage.isCompleted ? 'Reading Done' : 'Reading Pending'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {reflection.isCompleted ? 'Complete' : 'Pending'}
            </div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {reflection.isCompleted ? 'Reflection Done' : 'Reflection Pending'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
