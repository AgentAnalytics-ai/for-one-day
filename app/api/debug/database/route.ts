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
      tables: {}
    }

    // Test each table that the dashboard needs
    const tablesToTest = [
      'profiles',
      'user_stats', 
      'daily_reflections',
      'vault_items',
      'families',
      'family_members',
      'subscriptions',
      'user_preferences'
    ]

    for (const tableName of tablesToTest) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1)

        results.tables[tableName] = {
          exists: !error,
          error: error?.message || null,
          count: count || 0,
          sample_data: data?.[0] || null
        }
      } catch (err) {
        results.tables[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0,
          sample_data: null
        }
      }
    }

    // Test specific queries that the dashboard makes
    const dashboardQueries: any = {}

    // Test user_stats query
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      dashboardQueries.user_stats = {
        success: !error,
        error: error?.message || null,
        data: data || null
      }
    } catch (err) {
      dashboardQueries.user_stats = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null
      }
    }

    // Test daily_reflections query
    try {
      const { data, error } = await supabase
        .from('daily_reflections')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      dashboardQueries.daily_reflections = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data || []
      }
    } catch (err) {
      dashboardQueries.daily_reflections = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0,
        data: []
      }
    }

    // Test vault_items query
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('id')
        .eq('owner_id', user.id)
      
      dashboardQueries.vault_items = {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0,
        data: data || []
      }
    } catch (err) {
      dashboardQueries.vault_items = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0,
        data: []
      }
    }

    // Test profiles query
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      
      dashboardQueries.profiles = {
        success: !error,
        error: error?.message || null,
        data: data || null
      }
    } catch (err) {
      dashboardQueries.profiles = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null
      }
    }

    results.dashboard_queries = dashboardQueries

    return NextResponse.json({
      success: true,
      debug_info: results
    })

  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { 
        error: 'Database debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
