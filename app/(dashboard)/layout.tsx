import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimpleNav } from '@/components/dashboard/simple-nav'
import { SupportFooter } from '@/components/support-footer'

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

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleNav profile={profile} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <SupportFooter />
    </div>
  )
}

