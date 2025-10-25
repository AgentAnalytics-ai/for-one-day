'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import Link from 'next/link'

interface UserStats {
  reflectionStreak: number
  totalReflections: number
  totalLegacyNotes: number
  lastReflectionDate: string | null
}

interface DailyReflection {
  day: number
  scripture: {
    ref: string
    text: string
  }
  question: string
  date: string
  completed: boolean
  userReflection: string | null
}

export function SimpleDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null)
  const [accountStatus, setAccountStatus] = useState<'free' | 'pro' | 'lifetime'>('free')

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats/simple')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  const loadTodayReflection = useCallback(async () => {
    try {
      const response = await fetch('/api/reflection/daily')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTodayReflection(data.reflection)
        }
      }
    } catch (error) {
      console.error('Error loading reflection:', error)
    }
  }, [])

  const loadAccountStatus = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user?.id)
        .single()
      
      if (profile) {
        setAccountStatus(profile.plan as 'free' | 'pro' | 'lifetime')
      }
    } catch (error) {
      console.error('Error loading account status:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      loadStats()
      loadTodayReflection()
      loadAccountStatus()
    }
  }, [user, loadStats, loadTodayReflection, loadAccountStatus])

  // Refresh stats when component becomes visible (user navigates back to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, loadStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : 
                   new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">
          {greeting}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <SubscriptionBadge tier={accountStatus} />
      </div>

      {/* Simple Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.reflectionStreak}
            </div>
            <div className="text-sm text-gray-600 mb-2">Day Streak</div>
            <div className="text-xs text-gray-500">
              {stats.reflectionStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
            </div>
          </PremiumCard>

          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalReflections}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Reflections</div>
            <div className="text-xs text-gray-500">
              {stats.totalReflections > 0 ? 'Growing in faith!' : 'Start reflecting today!'}
            </div>
          </PremiumCard>

          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalLegacyNotes}
            </div>
            <div className="text-sm text-gray-600 mb-2">Legacy Notes</div>
            <div className="text-xs text-gray-500">
              {stats.totalLegacyNotes > 0 ? 'Building your legacy!' : 'Start your legacy today!'}
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Today's Reflection */}
      {todayReflection && (
        <PremiumCard className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
              Today&apos;s Reflection
            </h2>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <div className="text-lg text-blue-600 font-medium mb-3">
                {todayReflection.scripture.ref}
              </div>
              <div className="text-lg text-gray-700 italic mb-4">
                &ldquo;{todayReflection.scripture.text}&rdquo;
              </div>
              <div className="text-lg text-gray-800 font-medium">
                {todayReflection.question}
              </div>
            </div>

            {todayReflection.completed ? (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium">Reflection completed!</span>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <Link href="/reflection">
                  <PremiumButton size="lg" className="px-8 py-4">
                    Start Today&apos;s Reflection
                  </PremiumButton>
                </Link>
              </div>
            )}
          </div>
        </PremiumCard>
      )}

      {/* Quick Actions */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/reflection">
            <PremiumButton variant="secondary" className="w-full">
              Daily Reflection
            </PremiumButton>
          </Link>
          <Link href="/vault">
            <PremiumButton variant="secondary" className="w-full">
              Legacy Notes
            </PremiumButton>
          </Link>
        </div>
      </PremiumCard>

      {/* Legacy Notes Preview */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Legacy</h3>
        <p className="text-gray-600 mb-4">
          Preserve your wisdom, love, and life lessons for your family. Create letters, 
          advice, and memories that will last for generations.
        </p>
        <Link href="/vault">
          <PremiumButton className="w-full">
            {stats && stats.totalLegacyNotes > 0 ? 'View Your Legacy Notes' : 'Create Your First Legacy Note'}
          </PremiumButton>
        </Link>
      </PremiumCard>
    </div>
  )
}
