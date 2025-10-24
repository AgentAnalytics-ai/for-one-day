/**
 * 🗄️ 2026 Expert Database Testing System
 * Comprehensive database connectivity and health checks
 */

import { createClient } from '@/lib/supabase/server'
import { createDebugContext, logError, logSuccess } from './debug'

export interface DatabaseTestResult {
  success: boolean
  error?: string
  details: {
    connection: boolean
    auth: boolean
    tables: string[]
    userProfile?: Record<string, unknown>
    familyData?: Record<string, unknown>
  }
}

export async function testDatabaseConnection(userId?: string): Promise<DatabaseTestResult> {
  const context = createDebugContext('database_test', userId)
  const supabase = await createClient()
  
  const result: DatabaseTestResult = {
    success: false,
    details: {
      connection: false,
      auth: false,
      tables: []
    }
  }

  try {
    // Test 1: Basic connection
    logSuccess(context, 'Testing basic database connection...')
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      logError(context, 'Database connection failed', connectionError)
      result.error = `Connection failed: ${connectionError.message}`
      return result
    }
    
    result.details.connection = true
    logSuccess(context, 'Database connection successful')

    // Test 2: Authentication
    logSuccess(context, 'Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      logError(context, 'Authentication failed', authError)
      result.error = `Authentication failed: ${authError.message}`
      return result
    }
    
    if (!user) {
      logError(context, 'No authenticated user found', new Error('No user'))
      result.error = 'No authenticated user'
      return result
    }
    
    result.details.auth = true
    logSuccess(context, `Authentication successful for user: ${user.id}`)

    // Test 3: Check required tables
    logSuccess(context, 'Testing table accessibility...')
    const tables = ['profiles', 'families', 'family_members', 'devotion_entries', 'vault_items']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (tableError) {
          logError(context, `Table ${table} not accessible`, tableError)
        } else {
          result.details.tables.push(table)
          logSuccess(context, `Table ${table} accessible`)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error')
        logError(context, `Error testing table ${table}`, errorObj)
      }
    }

    // Test 4: User profile check
    if (userId) {
      logSuccess(context, 'Testing user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (profileError) {
        logError(context, 'User profile not found', profileError)
      } else {
        result.details.userProfile = profile
        logSuccess(context, 'User profile found')
      }

      // Test 5: Family data check
      logSuccess(context, 'Testing family data...')
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select(`
          family_id,
          role,
          families (
            id,
            name,
            owner_id
          )
        `)
        .eq('user_id', userId)
        .single()
      
      if (familyError) {
        logError(context, 'Family data not found', familyError)
      } else {
        result.details.familyData = familyMember
        logSuccess(context, 'Family data found')
      }
    }

    result.success = true
    logSuccess(context, 'Database test completed successfully')
    
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error')
    logError(context, 'Database test failed with exception', errorObj)
    result.error = `Test failed: ${errorObj.message}`
  }

  return result
}

export async function testEnvironmentVariables(): Promise<{ success: boolean; missing: string[] }> {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing: string[] = []
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  return {
    success: missing.length === 0,
    missing
  }
}
