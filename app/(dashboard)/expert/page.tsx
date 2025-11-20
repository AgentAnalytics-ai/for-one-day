'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { ExpertAnalysis } from '@/lib/ai'

/**
 * 🧠 Expert Advisor - 2026 AI, Web Apps & UX Excellence
 * Interactive expert system providing insights and recommendations
 * Cost-optimized: No auto-loading, 24hr caching, rate limiting
 */
export default function ExpertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ExpertAnalysis | null>(null)
  const [question, setQuestion] = useState('')
  const [activeTab, setActiveTab] = useState<'ai' | 'web' | 'ux' | 'insights'>('ai')
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastRequestTimeRef = useRef<number>(0)

  useEffect(() => {
    // Check auth and auto-load analysis (with smart caching)
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Try to load from cache first (24 hour cache) - instant UX
      const cached = localStorage.getItem('expert-analysis-cache')
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          const hoursSinceCache = (Date.now() - timestamp) / (1000 * 60 * 60)
          if (hoursSinceCache < 24) {
            setAnalysis(data)
            // Still check for fresh data in background (but don't block UI)
            loadAnalysis()
            return
          }
        } catch (e) {
          // Invalid cache, continue to load fresh
        }
      }

      // No cache or expired - load fresh analysis
      loadAnalysis()
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadAnalysis = async (customQuestion?: string) => {
    // Rate limiting: max 1 request per minute
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTimeRef.current
    if (timeSinceLastRequest < 60000 && lastRequestTimeRef.current > 0) {
      const secondsLeft = Math.ceil((60000 - timeSinceLastRequest) / 1000)
      setError(`Please wait ${secondsLeft} second${secondsLeft > 1 ? 's' : ''} before requesting another analysis.`)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)
    lastRequestTimeRef.current = now

    try {
      const response = await fetch('/api/expert/analyze', {
        method: customQuestion ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: customQuestion ? JSON.stringify({ question: customQuestion }) : undefined,
        signal: abortControllerRef.current.signal,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load expert analysis')
      }

      setAnalysis(data.analysis)
      
      // Cache for 24 hours (aggressive caching to save costs)
      localStorage.setItem('expert-analysis-cache', JSON.stringify({
        data: data.analysis,
        timestamp: Date.now()
      }))
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Request was cancelled, ignore
      }
      console.error('Error loading expert analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load expert analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    await loadAnalysis(question)
    setQuestion('')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-4 border-blue-500 bg-blue-50'
      default:
        return 'border-l-4 border-gray-500 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">High Priority</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Medium Priority</span>
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Low Priority</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-gray-900">
              Expert Advisor
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              2026 AI, Web Apps & UX Best Practices
            </p>
          </div>
        </div>

        {/* Question Input */}
        <form onSubmit={handleSubmitQuestion} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a specific question about AI, web apps, or UX..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Ask Expert'}
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !analysis && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Scanning codebase and generating expert insights...</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'ai' as const, label: 'AI Agenda 2026', count: analysis.aiRecommendations.length },
                { id: 'web' as const, label: 'Web App Best Practices', count: analysis.webAppRecommendations.length },
                { id: 'ux' as const, label: 'UX Excellence', count: analysis.uxRecommendations.length },
                { id: 'insights' as const, label: 'Codebase Insights', count: 1 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* AI Recommendations */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">
                  2026 AI Agenda
                </h2>
                <p className="text-gray-600">
                  Latest AI trends, best practices, and opportunities for your application
                </p>
              </div>
              {analysis.aiRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-lg ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  {rec.actionable.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Actionable Steps:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {rec.actionable.map((action, actionIdx) => (
                          <li key={actionIdx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Web App Recommendations */}
          {activeTab === 'web' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">
                  Web App Best Practices
                </h2>
                <p className="text-gray-600">
                  Modern architecture, performance, and scalability recommendations
                </p>
              </div>
              {analysis.webAppRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-lg ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  {rec.actionable.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Actionable Steps:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {rec.actionable.map((action, actionIdx) => (
                          <li key={actionIdx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* UX Recommendations */}
          {activeTab === 'ux' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">
                  UX Excellence
                </h2>
                <p className="text-gray-600">
                  Principles for creating exceptional user experiences in 2026
                </p>
              </div>
              {analysis.uxRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-lg ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  {rec.actionable.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Actionable Steps:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {rec.actionable.map((action, actionIdx) => (
                          <li key={actionIdx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Codebase Insights */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">
                  Codebase Insights
                </h2>
                <p className="text-gray-600">
                  Analysis of your current codebase and recommended next steps
                </p>
              </div>

              {/* Strengths */}
              {analysis.codebaseInsights.strengths.length > 0 && (
                <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current Strengths
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {analysis.codebaseInsights.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opportunities */}
              {analysis.codebaseInsights.opportunities.length > 0 && (
                <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Opportunities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {analysis.codebaseInsights.opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {analysis.codebaseInsights.nextSteps.length > 0 && (
                <div className="p-6 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Recommended Next Steps
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {analysis.codebaseInsights.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State - Only shows if loading failed and no cached data */}
      {!loading && !analysis && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading expert insights...</p>
        </div>
      )}
    </div>
  )
}

