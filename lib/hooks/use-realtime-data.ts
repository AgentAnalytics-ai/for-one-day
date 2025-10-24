'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserStats {
  devotionStreak: number
  familyConnections: number
  legacyNotes: number
  lastReflectionDate?: string
}

export function useRealtimeData(userId?: string) {
  const [stats, setStats] = useState<UserStats>({
    devotionStreak: 0,
    familyConnections: 0,
    legacyNotes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        // Get devotion streak (consecutive days with reflections)
        const { data: devotionEntries, error: devotionError } = await supabase
          .from('devotion_entries')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (devotionError) throw devotionError

        // Calculate streak
        const streak = calculateStreak(devotionEntries?.map(entry => entry.created_at) || [])

        // Get family connections (count of legacy notes with family recipients)
        const { count: familyConnections, error: familyError } = await supabase
          .from('vault_items')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', userId)
          .eq('kind', 'letter')
          .in('metadata->recipient', ['wife', 'son', 'daughter', 'children', 'family'])

        if (familyError) throw familyError

        // Get legacy notes count
        const { count: legacyNotes, error: legacyError } = await supabase
          .from('vault_items')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', userId)
          .eq('kind', 'letter')

        if (legacyError) throw legacyError

        setStats({
          devotionStreak: streak,
          familyConnections: familyConnections || 0,
          legacyNotes: legacyNotes || 0,
          lastReflectionDate: devotionEntries?.[0]?.created_at
        })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats'
        setError(errorMessage)
        console.error('Error fetching user stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time subscriptions
    const devotionSubscription = supabase
      .channel('devotion_entries_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'devotion_entries',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          // Refetch stats when devotion entries change
          fetchStats()
        }
      )
      .subscribe()

    const vaultSubscription = supabase
      .channel('vault_items_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vault_items',
          filter: `owner_id=eq.${userId}`
        }, 
        () => {
          // Refetch stats when vault items change
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      devotionSubscription.unsubscribe()
      vaultSubscription.unsubscribe()
    }
  }, [userId])

  return { stats, loading, error }
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  // Get unique dates (in case user has multiple entries per day)
  const uniqueDates = [...new Set(dates.map(date => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  }))].sort().reverse() // Most recent first

  if (uniqueDates.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const currentDate = new Date(today)

  for (const dateStr of uniqueDates) {
    const expectedDateStr = currentDate.toISOString().split('T')[0]
    
    if (dateStr === expectedDateStr) {
      streak++
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Check if it's a gap of more than 1 day
      const entryDate = new Date(dateStr)
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > streak + 1) {
        // Gap too large, streak is broken
        break
      } else if (daysDiff === streak + 1) {
        // This entry is the next day in the streak
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }
  }

  return streak
}
