/**
 * 📊 Simple Stats API
 * Basic stats for the core features only
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get total reflections
    const { data: reflections, error: reflectionsError } = await supabase
      .from('daily_reflections')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Get total legacy notes
    const { data: legacyNotes, error: legacyError } = await supabase
      .from('vault_items')
      .select('id')
      .eq('owner_id', user.id)

    // Calculate reflection streak
    let reflectionStreak = 0
    if (reflections && reflections.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < reflections.length; i++) {
        const reflectionDate = new Date(reflections[i].date)
        reflectionDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - reflectionDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === i) {
          reflectionStreak++
        } else {
          break
        }
      }
    }

    const stats = {
      reflectionStreak,
      totalReflections: reflections?.length || 0,
      totalLegacyNotes: legacyNotes?.length || 0,
      lastReflectionDate: reflections && reflections.length > 0 ? reflections[0].date : null
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
