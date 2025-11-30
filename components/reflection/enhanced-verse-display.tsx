'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Sparkles, Lock } from 'lucide-react'
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

  useEffect(() => {
    if (isPro) {
      loadEnhancedVerse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, verse.reference])

  const loadEnhancedVerse = async () => {
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
      
      if (response.ok && data.enhanced) {
        setEnhanced(data.enhanced)
        // Set default prompt based on user preference or use understanding
        const initialPrompt = data.enhanced.prompts.understanding || defaultPrompt
        setSelectedPrompt(initialPrompt)
        onPromptChange?.(initialPrompt)
      }
    } catch (error) {
      console.error('Error loading enhanced verse:', error)
    } finally {
      setLoading(false)
    }
  }

  // Free users see basic version with upgrade CTA
  if (!isPro) {
    return (
      <>
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
            <p className="text-xs text-gray-500 capitalize mb-4">
              Theme: {verse.theme}
            </p>
            
            {/* Upgrade CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Unlock Deeper Understanding
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Pro users get AI-powered verse explanations, context, and multiple reflection prompts to deepen your spiritual growth.
                  </p>
                  <PremiumButton
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Upgrade to Pro
                  </PremiumButton>
                </div>
              </div>
            </div>
          </div>
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
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4"></div>
        </div>
      </div>
    )
  }

  if (!enhanced) {
    // Fallback to basic if enhancement fails
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
      {/* Verse Text */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-lg">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg text-blue-600 font-medium">
              {enhanced.reference}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              <Sparkles className="w-3 h-3" />
              Enhanced
            </span>
          </div>
          <p className="text-lg text-gray-700 italic mb-4">
            &ldquo;{enhanced.text}&rdquo;
          </p>
        </div>
      </div>

      {/* Explanation Section - Collapsible */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between text-left mb-2"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Understanding This Verse
            </h3>
          </div>
          {showExplanation ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showExplanation && (
          <div className="space-y-4 mt-4">
            {/* Context */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Context</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {enhanced.explanation.context}
              </p>
            </div>

            {/* Meaning */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Meaning</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {enhanced.explanation.meaning}
              </p>
            </div>

            {/* Key Words */}
            {enhanced.explanation.keyWords.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Key Words</p>
                <div className="flex flex-wrap gap-2">
                  {enhanced.explanation.keyWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-medium text-indigo-700"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cross References */}
            {enhanced.explanation.crossReferences && enhanced.explanation.crossReferences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Related Verses</p>
                <div className="flex flex-wrap gap-2">
                  {enhanced.explanation.crossReferences.map((ref, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs text-indigo-600"
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

      {/* Reflection Prompts */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reflection Questions
        </h3>
        
        <div className="space-y-3">
          {/* Understanding */}
          <button
            onClick={() => {
              setSelectedPrompt(enhanced.prompts.understanding)
              onPromptChange?.(enhanced.prompts.understanding)
            }}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedPrompt === enhanced.prompts.understanding
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-xs font-medium text-gray-500 mb-1">Understanding</p>
            <p className="text-sm text-gray-800">{enhanced.prompts.understanding}</p>
          </button>

          {/* Application */}
          <button
            onClick={() => {
              setSelectedPrompt(enhanced.prompts.application)
              onPromptChange?.(enhanced.prompts.application)
            }}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedPrompt === enhanced.prompts.application
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-xs font-medium text-gray-500 mb-1">Application</p>
            <p className="text-sm text-gray-800">{enhanced.prompts.application}</p>
          </button>

          {/* Reflection */}
          <button
            onClick={() => {
              setSelectedPrompt(enhanced.prompts.reflection)
              onPromptChange?.(enhanced.prompts.reflection)
            }}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedPrompt === enhanced.prompts.reflection
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-xs font-medium text-gray-500 mb-1">Reflection</p>
            <p className="text-sm text-gray-800">{enhanced.prompts.reflection}</p>
          </button>

          {/* Gratitude (if available) */}
          {enhanced.prompts.gratitude && (
            <button
              onClick={() => {
                setSelectedPrompt(enhanced.prompts.gratitude!)
                onPromptChange?.(enhanced.prompts.gratitude!)
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedPrompt === enhanced.prompts.gratitude
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">Gratitude</p>
              <p className="text-sm text-gray-800">{enhanced.prompts.gratitude}</p>
            </button>
          )}

          {/* Action (if available) */}
          {enhanced.prompts.action && (
            <button
              onClick={() => {
                setSelectedPrompt(enhanced.prompts.action!)
                onPromptChange?.(enhanced.prompts.action!)
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedPrompt === enhanced.prompts.action
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">Action</p>
              <p className="text-sm text-gray-800">{enhanced.prompts.action}</p>
            </button>
          )}

          {/* Quick (if available) */}
          {enhanced.prompts.quick && (
            <button
              onClick={() => {
                setSelectedPrompt(enhanced.prompts.quick!)
                onPromptChange?.(enhanced.prompts.quick!)
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedPrompt === enhanced.prompts.quick
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">Quick Reflection</p>
              <p className="text-sm text-gray-800">{enhanced.prompts.quick}</p>
            </button>
          )}
        </div>

        {/* Selected Prompt Display */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">Your Reflection Prompt</p>
          <p className="text-lg text-gray-800 font-medium">
            {selectedPrompt}
          </p>
          <p className="text-xs text-gray-500 capitalize mt-2">
            Theme: {enhanced.theme}
          </p>
        </div>
      </div>
    </div>
  )
}

