import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — server-only. Never import from client components.
 * Used for Auth Admin API and other operations that bypass RLS.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return null
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
