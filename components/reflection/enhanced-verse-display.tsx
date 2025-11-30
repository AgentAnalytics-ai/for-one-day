'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Sparkles, Lock, X } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { UpgradeModal } from '@/components/ui/upgrade-modal'

interface VerseExplanation {
  context: string
  meaning: string
  keyWords: string[]
  crossReferences?: string[]
}

interface VersePrompts {
  understanding: string
  application: string
  reflection: string
  gratitude?: string
  action?: string
  quick?: string
}

interface EnhancedVerse {
  reference: string
  text: string
  theme: string
  explanation: VerseExplanation
  prompts: VersePrompts
}

interface EnhancedVerseDisplayProps {
  verse: {
    reference: string
    text: string
    theme: string
  }
  isPro: boolean
  defaultPrompt: string
  onPromptChange?: (prompt: string) => void
}

export function EnhancedVerseDisplay({ 
  verse, 
  isPro, 
  defaultPrompt,
  onPromptChange
}: EnhancedVerseDisplayProps) {
  const [enhanced, setEnhanced] = useState<EnhancedVerse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<string>(defaultPrompt)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showKeyWords, setShowKeyWords] = useState(false)
  const [showRelatedVerses, setShowRelatedVerses] = useState(false)
  const [showReflectionPrompts, setShowReflectionPrompts] = useState(false)
  const [showProInsights, setShowProInsights] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  useEffect(() => {
    console.log('EnhancedVerseDisplay - isPro:', isPro, 'verse:', verse.reference)
    if (isPro) {
      console.log('Loading enhanced verse for Pro user...')
      loadEnhancedVerse()
    } else {
      console.log('User is not Pro, showing basic version')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, verse.reference])

  const loadEnhancedVerse = async () => {
    console.log('loadEnhancedVerse called for:', verse.reference)
    setLoading(true)
    try {
      const response = await fetch('/api/verse/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: verse.reference,
          text: verse.text,
          theme: verse.theme
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('API error:', data.error, 'Status:', response.status)
        if (response.status === 403) {
          console.warn('User marked as Pro but API returned 403 - subscription check may be failing')
        }
        return
      }
      
      if (data.enhanced) {
        setEnhanced(data.enhanced)
        const initialPrompt = data.enhanced.prompts.understanding || defaultPrompt
        setSelectedPrompt(initialPrompt)
        onPromptChange?.(initialPrompt)
      } else {
        console.warn('API returned success but no enhanced data:', data)
      }
    } catch (error) {
      console.error('Error loading enhanced verse:', error)
    } finally {
      setLoading(false)
    }
  }

  // Free users - Clean, simple, with subtle "Get Pro Insights" reveal
  if (!isPro) {
    const handleGetProInsights = async () => {
      setIsGeneratingInsights(true)
      // Simulate AI generation delay for better UX (feels live)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setShowProInsights(true)
      setIsGeneratingInsights(false)
    }

    return (
      <>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
          {/* Verse - Always Visible */}
          <div className="mb-6">
            <p className="text-xl text-blue-600 font-medium mb-3">
              {verse.reference}
            </p>
            <p className="text-lg text-gray-700 italic leading-relaxed">
              &ldquo;{verse.text}&rdquo;
            </p>
          </div>

          {/* Reflection Prompt - Always Visible */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-lg text-gray-800 font-medium mb-2">
              {defaultPrompt}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              Theme: {verse.theme}
            </p>
          </div>

          {/* Get Pro Insights Button - Subtle, Not Pushy */}
          {!showProInsights && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleGetProInsights}
                disabled={isGeneratingInsights}
                className="w-full group flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 rounded-lg transition-all duration-200 hover:shadow-sm disabled:opacity-50"
              >
                {isGeneratingInsights ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-blue-700">Generating insights...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-blue-700">Get Pro Insights</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                AI-powered explanations, context & multiple prompts
              </p>
            </div>
          )}

          {/* Pro Insights Reveal - Feels Like Live AI Generation */}
          {showProInsights && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Pro Insights Available
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      Upgrade to Pro to unlock AI-powered verse explanations, historical context, key word analysis, related verses, and multiple reflection prompts tailored to your spiritual growth.
                    </p>
                    <PremiumButton
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full sm:w-auto"
                    >
                      Upgrade to Pro
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {showUpgradeModal && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            feature="Enhanced Verse Explanations"
          />
        )}
      </>
    )
  }

  // Pro users see enhanced version
  // Show loading state while fetching
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4"></div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Loading enhanced verse insights...
        </p>
      </div>
    )
  }

  // If Pro user but no enhanced data after loading, show error state with retry
  if (!enhanced && isPro) {
    return (
      <div className="space-y-4">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-lg">
          <div className="mb-4">
            <p className="text-lg text-blue-600 font-medium mb-2">
              {verse.reference}
            </p>
            <p className="text-lg text-gray-700 italic mb-4">
              &ldquo;{verse.text}&rdquo;
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-lg text-gray-800 font-medium mb-2">
              {defaultPrompt}
            </p>
            <p className="text-xs text-gray-500 capitalize mb-3">
              Theme: {verse.theme}
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 mb-3">
            ⚠️ Enhanced verse insights are temporarily unavailable.
          </p>
          <button
            onClick={loadEnhancedVerse}
            className="text-sm text-yellow-700 underline hover:text-yellow-900 font-medium"
          >
            Try loading enhanced insights again
          </button>
          <p className="text-xs text-yellow-700 mt-2">
            Check browser console (F12) for error details.
          </p>
        </div>
      </div>
    )
  }

  // Fallback to basic (shouldn't happen for Pro users, but just in case)
  if (!enhanced) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
        <div className="mb-4">
          <p className="text-lg text-blue-600 font-medium mb-2">
            {verse.reference}
          </p>
          <p className="text-lg text-gray-700 italic mb-4">
            &ldquo;{verse.text}&rdquo;
          </p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-lg text-gray-800 font-medium mb-2">
            {defaultPrompt}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            Theme: {verse.theme}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Verse Text - Hero Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/50 shadow-lg relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xl md:text-2xl text-blue-600 font-medium mb-3">
                {enhanced.reference}
              </p>
              <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                &ldquo;{enhanced.text}&rdquo;
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full shadow-sm ml-4">
              <Sparkles className="w-3.5 h-3.5" />
              Enhanced
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Meaning & Context (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Meaning - Prominent */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Meaning</h3>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              {enhanced.explanation.meaning}
            </p>
          </div>

          {/* Context - Collapsible */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between text-left p-4 hover:bg-gray-50/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-sm font-medium text-gray-700">Context</span>
              </div>
              {showExplanation ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {showExplanation && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {enhanced.explanation.context}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Collapsible Dropdowns (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-3">
          {/* Key Words - Collapsible Dropdown */}
          {enhanced.explanation.keyWords.length > 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowKeyWords(!showKeyWords)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">Key Words</span>
                  <span className="text-xs text-gray-400">({enhanced.explanation.keyWords.length})</span>
                </div>
                {showKeyWords ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {showKeyWords && (
                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-2">
                    {enhanced.explanation.keyWords.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full text-xs font-medium text-blue-700"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Verses - Collapsible Dropdown */}
          {enhanced.explanation.crossReferences && enhanced.explanation.crossReferences.length > 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowRelatedVerses(!showRelatedVerses)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-sm font-medium text-gray-700">Related Verses</span>
                  <span className="text-xs text-gray-400">({enhanced.explanation.crossReferences.length})</span>
                </div>
                {showRelatedVerses ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {showRelatedVerses && (
                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-2">
                    {enhanced.explanation.crossReferences.map((ref, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-full text-xs font-medium text-indigo-700"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reflection Prompts - Compact & Collapsible */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-white/50 shadow-lg overflow-hidden">
        {/* Header - Always Visible */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Your Reflection Prompt
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedPrompt}
              </p>
              <p className="text-xs text-gray-500 capitalize mt-2">
                Theme: {enhanced.theme}
              </p>
            </div>
            <button
              onClick={() => setShowReflectionPrompts(!showReflectionPrompts)}
              className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showReflectionPrompts ? 'Hide Options' : 'Change Prompt'}
            </button>
          </div>
        </div>

        {/* Prompts Grid - Collapsible */}
        {showReflectionPrompts && (
          <div className="p-4 bg-gray-50/50 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Choose a Different Focus
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Understanding */}
              <button
                onClick={() => {
                  setSelectedPrompt(enhanced.prompts.understanding)
                  onPromptChange?.(enhanced.prompts.understanding)
                  setShowReflectionPrompts(false)
                }}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedPrompt === enhanced.prompts.understanding
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">Understanding</p>
                <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.understanding}</p>
              </button>

              {/* Application */}
              <button
                onClick={() => {
                  setSelectedPrompt(enhanced.prompts.application)
                  onPromptChange?.(enhanced.prompts.application)
                  setShowReflectionPrompts(false)
                }}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedPrompt === enhanced.prompts.application
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">Application</p>
                <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.application}</p>
              </button>

              {/* Reflection */}
              <button
                onClick={() => {
                  setSelectedPrompt(enhanced.prompts.reflection)
                  onPromptChange?.(enhanced.prompts.reflection)
                  setShowReflectionPrompts(false)
                }}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedPrompt === enhanced.prompts.reflection
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">Reflection</p>
                <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.reflection}</p>
              </button>

              {/* Gratitude (if available) */}
              {enhanced.prompts.gratitude && (
                <button
                  onClick={() => {
                    setSelectedPrompt(enhanced.prompts.gratitude!)
                    onPromptChange?.(enhanced.prompts.gratitude!)
                    setShowReflectionPrompts(false)
                  }}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedPrompt === enhanced.prompts.gratitude
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500 mb-1">Gratitude</p>
                  <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.gratitude}</p>
                </button>
              )}

              {/* Action (if available) */}
              {enhanced.prompts.action && (
                <button
                  onClick={() => {
                    setSelectedPrompt(enhanced.prompts.action!)
                    onPromptChange?.(enhanced.prompts.action!)
                    setShowReflectionPrompts(false)
                  }}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedPrompt === enhanced.prompts.action
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500 mb-1">Action</p>
                  <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.action}</p>
                </button>
              )}

              {/* Quick (if available) */}
              {enhanced.prompts.quick && (
                <button
                  onClick={() => {
                    setSelectedPrompt(enhanced.prompts.quick!)
                    onPromptChange?.(enhanced.prompts.quick!)
                    setShowReflectionPrompts(false)
                  }}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedPrompt === enhanced.prompts.quick
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500 mb-1">Quick Reflection</p>
                  <p className="text-xs text-gray-700 leading-snug">{enhanced.prompts.quick}</p>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
