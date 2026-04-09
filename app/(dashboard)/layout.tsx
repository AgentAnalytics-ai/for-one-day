import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimpleNav } from '@/components/dashboard/simple-nav'
import { SupportFooter } from '@/components/support-footer'
import { NavigationTour } from '@/components/onboarding/navigation-tour'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { SkipLink } from '@/components/ui/skip-link'

/**
 * 🏠 Dashboard layout - Simplified
 * Protected - requires authentication
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login')
  }

  // Check email verification (grandfather existing users)
  // Only require verification for users created after email verification was enabled
  const verificationRequiredDate = new Date('2026-01-22') // Date when email verification was enabled
  const userCreatedDate = new Date(user.created_at)
  
  if (!user.email_confirmed_at && userCreatedDate >= verificationRequiredDate) {
    redirect('/auth/check-email?email=' + encodeURIComponent(user.email || ''))
  }

  // Fetch user profile (or create if missing)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let profile = profileData

  // If profile doesn't exist, create one
  if (profileError && profileError.code === 'PGRST116') {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        plan: 'free',
        full_name: user.email?.split('@')[0] || 'User'
      })
      .select('*')
      .single()

    if (newProfile) {
      profile = newProfile
    }
  }

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-gradient-to-b from-slate-100/90 via-slate-50 to-[#eef2f6]">
      <SkipLink />
      <KeyboardShortcuts />
      <NavigationTour />
      <SimpleNav profile={profile} />

      <main
        id="main-content"
        className="flex w-full flex-1 px-4 py-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:py-7 md:py-9 lg:px-8 lg:pb-12 lg:pt-5"
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      <SupportFooter />
    </div>
  )
}

