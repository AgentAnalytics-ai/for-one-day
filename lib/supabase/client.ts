import { createBrowserClient } from '@supabase/ssr'

/**
 * 🌐 Client-side Supabase client
 * Use in Client Components only
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured - using placeholder values')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

