'use client'

import { BookOpen, Sparkles, TrendingUp, Tag } from 'lucide-react'
import { useState } from 'react'

interface TurnThePageInsights {
  extractedText: {
    bibleVerse?: string
    handwrittenNotes?: string
    printedText?: string
  }
  insights: {
    summary: string
    connections: string
    themes: string[]
    personalGrowth: string
  }
  photoDescription: string
  verseMatch: {
    found: boolean
    confidence: number
    matchedVerse?: string
  }
}

interface TurnThePageChallengeProps {
  insights: TurnThePageInsights
}

export function TurnThePageChallenge({ insights }: TurnThePageChallengeProps) {
  const [expanded, setExpanded] = useState(false)

  if (!insights || !insights.insights?.summary) {
    return null
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-amber-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
          <BookOpen className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            📖 Turn the Page Challenge
          </h3>
          <p className="text-sm text-amber-700">
            AI-Powered Insights
          </p>
        </div>
      </div>

      {/* Summary - Always Visible */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-amber-100">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-800 leading-relaxed">
            {insights.insights.summary}
          </p>
        </div>
      </div>

      {/* Expandable Details */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-sm text-amber-700 hover:text-amber-900 font-medium py-2 hover:bg-amber-100 rounded-lg transition-colors"
        >
          View Full Insights ↓
        </button>
      ) : (
        <div className="space-y-4">
          {/* Connections */}
          {insights.insights.connections && (
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Connections
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {insights.insights.connections}
              </p>
            </div>
          )}

          {/* Themes */}
          {insights.insights.themes && insights.insights.themes.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.insights.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personal Growth */}
          {insights.insights.personalGrowth && (
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Growth Insight
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {insights.insights.personalGrowth}
              </p>
            </div>
          )}

          {/* Extracted Text (if available) */}
          {(insights.extractedText?.handwrittenNotes || insights.extractedText?.bibleVerse) && (
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-gray-900 mb-2">
                From Your Photo
              </h4>
              {insights.extractedText.bibleVerse && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Verse:</span> {insights.extractedText.bibleVerse}
                </p>
              )}
              {insights.extractedText.handwrittenNotes && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your Notes:</span> {insights.extractedText.handwrittenNotes}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setExpanded(false)}
            className="w-full text-sm text-amber-700 hover:text-amber-900 font-medium py-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            Show Less ↑
          </button>
        </div>
      )}
    </div>
  )
}
