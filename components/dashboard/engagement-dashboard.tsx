'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ToastContainer } from '@/components/ui/toast'
import { toast } from '@/lib/toast'
import Link from 'next/link'

interface EngagementStats {
  currentStreak: number
  longestStreak: number
  totalDevotions: number
  totalQuizzes: number
  totalLegacyNotes: number
  averageQuizScore: number
  thisWeekCount: number
  level: number
  progressToNextLevel: number
  achievements: Array<{
    id: string
    name: string
    description: string
  }>
  engagementScore: number
}

interface FamilyFlow {
  devotional: {
    title: string
    scripture: { ref: string; text: string }
    reflection: string | null
  }
  familyDiscussion: {
    prompts: string[]
    scripture: { ref: string; text: string }
    theme: string
  }
  legacyNotes: {
    suggestions: Array<{
      title: string
      description: string
      template: string
    }>
    templates: string[]
  }
}

export function EngagementDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<EngagementStats | null>(null)
  const [familyFlow, setFamilyFlow] = useState<FamilyFlow | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Set up toast subscription
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadStats()
      loadFamilyFlow()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/engagement/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadFamilyFlow = async () => {
    try {
      const response = await fetch('/api/family/flow')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFamilyFlow(data.flow)
        }
      }
    } catch (error) {
      console.error('Error loading family flow:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your progress...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      
      <div className="space-y-6">
        {/* Engagement Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Streak */}
            <PremiumCard className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 mb-2">Day Streak</div>
              <div className="text-xs text-gray-500">
                {stats.currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </div>
            </PremiumCard>

            {/* Level Progress */}
            <PremiumCard className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                Level {stats.level}
              </div>
              <div className="text-sm text-gray-600 mb-2">Spiritual Growth</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressToNextLevel}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.progressToNextLevel}/100 to next level
              </div>
            </PremiumCard>

            {/* This Week */}
            <PremiumCard className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.thisWeekCount}
              </div>
              <div className="text-sm text-gray-600 mb-2">This Week</div>
              <div className="text-xs text-gray-500">
                {stats.thisWeekCount >= 5 ? 'Excellent week!' : 'Keep going!'}
              </div>
            </PremiumCard>

            {/* Quiz Average */}
            <PremiumCard className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.averageQuizScore}%
              </div>
              <div className="text-sm text-gray-600 mb-2">Quiz Average</div>
              <div className="text-xs text-gray-500">
                {stats.averageQuizScore >= 80 ? 'Great understanding!' : 'Keep studying!'}
              </div>
            </PremiumCard>
          </div>
        )}

        {/* Achievements */}
        {stats && stats.achievements.length > 0 && (
          <PremiumCard className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mr-3">🏆</div>
                  <div>
                    <div className="font-medium text-yellow-800">{achievement.name}</div>
                    <div className="text-sm text-yellow-600">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {/* Today's Flow */}
        {familyFlow && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Devotional */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📖 Today&apos;s Study</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">{familyFlow.devotional.title}</div>
                  <div className="text-sm text-gray-600">{familyFlow.devotional.scripture.ref}</div>
                </div>
                <div className="text-sm text-gray-700 italic">
                  &ldquo;{familyFlow.devotional.scripture.text}&rdquo;
                </div>
                {familyFlow.devotional.reflection && (
                  <div className="text-sm text-gray-600">
                    <strong>Your reflection:</strong> {familyFlow.devotional.reflection}
                  </div>
                )}
                <Link href="/devotional">
                  <PremiumButton size="sm" className="w-full">
                    {familyFlow.devotional.reflection ? 'Review Study' : 'Start Study'}
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>

            {/* Family Discussion */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">👨‍👩‍👧‍👦 Family Dinner</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Discussion prompts for tonight&apos;s dinner:
                </div>
                <div className="space-y-2">
                  {familyFlow.familyDiscussion.prompts.slice(0, 3).map((prompt, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {prompt}
                    </div>
                  ))}
                </div>
                <Link href="/table-talk">
                  <PremiumButton size="sm" variant="secondary" className="w-full">
                    View All Prompts
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>

            {/* Legacy Notes */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">💝 Legacy Notes</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Suggested legacy notes based on today&apos;s study:
                </div>
                <div className="space-y-2">
                  {familyFlow.legacyNotes.suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-900">{suggestion.title}</div>
                      <div className="text-gray-600">{suggestion.description}</div>
                    </div>
                  ))}
                </div>
                <Link href="/vault">
                  <PremiumButton size="sm" variant="secondary" className="w-full">
                    Create Legacy Note
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          </div>
        )}

        {/* Quick Actions */}
        <PremiumCard className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/devotional">
              <PremiumButton variant="secondary" className="w-full">
                📖 Daily Study
              </PremiumButton>
            </Link>
            <Link href="/table-talk">
              <PremiumButton variant="secondary" className="w-full">
                👨‍👩‍👧‍👦 Family Game
              </PremiumButton>
            </Link>
            <Link href="/vault">
              <PremiumButton variant="secondary" className="w-full">
                💝 Legacy Note
              </PremiumButton>
            </Link>
            <Link href="/family">
              <PremiumButton variant="secondary" className="w-full">
                📅 Family Plan
              </PremiumButton>
            </Link>
          </div>
        </PremiumCard>
      </div>
    </>
  )
}
