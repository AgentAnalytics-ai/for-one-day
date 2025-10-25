import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const results: any = {
      user_id: user.id,
      timestamp: new Date().toISOString()
    }

    // Test the exact same queries that the dashboard makes
    console.log('Testing dashboard queries for user:', user.id)

    // Test 1: user_stats table
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      results.user_stats = {
        success: !error,
        error: error?.message || null,
        data: data || null
      }
      console.log('user_stats result:', results.user_stats)
    } catch (err) {
      results.user_stats = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null
      }
    }

    // Test 2: daily_reflections table
    try {
      const { data, error } = await supabase
        .from('daily_reflections')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      results.daily_reflections = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data || []
      }
      console.log('daily_reflections result:', results.daily_reflections)
    } catch (err) {
      results.daily_reflections = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0,
        data: []
      }
    }

    // Test 3: vault_items table
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('id')
        .eq('owner_id', user.id)
      
      results.vault_items = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data || []
      }
      console.log('vault_items result:', results.vault_items)
    } catch (err) {
      results.vault_items = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0,
        data: []
      }
    }

    // Test 4: profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      
      results.profiles = {
        success: !error,
        error: error?.message || null,
        data: data || null
      }
      console.log('profiles result:', results.profiles)
    } catch (err) {
      results.profiles = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dashboard API test completed',
      results
    })

  } catch (error) {
    console.error('Dashboard test error:', error)
    return NextResponse.json(
      { 
        error: 'Dashboard test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
