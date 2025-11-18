import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimpleNav } from '@/components/dashboard/simple-nav'
import { SupportFooter } from '@/components/support-footer'
import { NavigationTour } from '@/components/onboarding/navigation-tour'

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationTour />
      <SimpleNav profile={profile} />
      
      <main className="flex-1 w-full py-4 sm:py-8">
        {children}
      </main>
      
      <SupportFooter />
    </div>
  )
}

