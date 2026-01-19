import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimpleNav } from '@/components/dashboard/simple-nav'
import { SupportFooter } from '@/components/support-footer'
import { NavigationTour } from '@/components/onboarding/navigation-tour'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex flex-col">
      <KeyboardShortcuts />
      <NavigationTour />
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <SimpleNav profile={profile} />
      </div>
      
      {/* Add bottom padding on mobile for bottom nav and footer - 2026 Meta-level spacing */}
      <main className="flex-1 w-full py-4 sm:py-6 md:py-8 pb-20 sm:pb-16 md:pb-12">
        {children}
      </main>
      
      <SupportFooter />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

