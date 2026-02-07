'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, PenTool, CheckCircle2 } from 'lucide-react'
import { QuickBiblePhoto } from '@/components/bible/quick-bible-photo'
import { EnhancedBibleProgress } from '@/components/bible/enhanced-bible-progress'
import { ReflectionForm } from '@/components/reflection/reflection-form'
import { EnhancedVerseDisplay } from '@/components/reflection/enhanced-verse-display'

interface UnifiedDailyPracticeV2Props {
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
  // Reflection form props
  reflectionForm: {
    initialReflection?: string
    initialImages?: Array<{ url: string; storage_path: string }>
    turnThePagePhoto?: { url: string; storage_path: string } | null
    readingContext?: string
  }
  isPro: boolean
}

/**
 * 🎯 Unified Daily Practice V2 - Clean & Professional
 * Single-page flow: Reflection primary, Bible reading optional (collapsible)
 * Progressive disclosure: Bible hidden by default, reflection always visible
 */
export function UnifiedDailyPracticeV2({ 
  turnThePage, 
  reflection,
  reflectionForm,
  isPro 
}: UnifiedDailyPracticeV2Props) {
  const [bibleExpanded, setBibleExpanded] = useState(false)

  return (
    <div className="space-y-6">
      {/* Primary: Reflection Section - Always Visible */}
      <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 rounded-2xl p-6 md:p-8 border-2 border-primary-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-primary-300">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-gray-900">
              Today's Reflection
            </h3>
          </div>
          {reflection.isCompleted && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold shadow-sm ring-1 ring-secondary-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete</span>
            </div>
          )}
        </div>

        {/* Verse Display */}
        <div className="mb-6">
          <EnhancedVerseDisplay
            verse={reflection.verse}
            isPro={isPro}
            defaultPrompt={reflection.prompt}
          />
        </div>

        {/* Reflection Form - Always Visible */}
        {!reflection.isCompleted ? (
          <ReflectionForm
            initialReflection={reflectionForm.initialReflection}
            initialImages={reflectionForm.initialImages}
            turnThePagePhoto={reflectionForm.turnThePagePhoto}
            readingContext={reflectionForm.readingContext}
          />
        ) : (
          <div className="bg-white rounded-xl p-6 border-2 border-green-300 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-semibold text-lg">Reflection Complete!</span>
            </div>
            <p className="text-gray-800 italic leading-relaxed whitespace-pre-wrap">
              &ldquo;{reflectionForm.initialReflection || 'Your reflection has been saved.'}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Secondary: Bible Reading - Collapsible */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setBibleExpanded(!bibleExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm transition-all duration-300 ${
              turnThePage.isCompleted
                ? 'bg-secondary-100 text-secondary-700 ring-2 ring-secondary-300'
                : 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
            }`}>
              {turnThePage.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                Bible Reading (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                {turnThePage.isCompleted 
                  ? `Day ${turnThePage.dayNumber} complete: ${turnThePage.book} ${turnThePage.chapter}`
                  : `Day ${turnThePage.dayNumber}: ${turnThePage.book} ${turnThePage.chapter}`
                }
              </p>
            </div>
          </div>
          {bibleExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Collapsible Content */}
        {bibleExpanded && (
          <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <EnhancedBibleProgress 
              progress={turnThePage.progress} 
              completedDays={turnThePage.completedDays}
            />
            
            {!turnThePage.isCompleted ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-4">
                    Read this chapter in your Bible, then take a photo
                  </p>
                  <QuickBiblePhoto
                    dayNumber={turnThePage.dayNumber}
                    book={turnThePage.book}
                    chapter={turnThePage.chapter}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-300 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-secondary-700 mx-auto mb-3" />
                <p className="text-secondary-900 font-semibold">
                  Day {turnThePage.dayNumber} Complete!
                </p>
                <p className="text-sm text-secondary-700 mt-1">
                  {turnThePage.book} {turnThePage.chapter}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
