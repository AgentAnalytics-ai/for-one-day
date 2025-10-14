import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EnterpriseNav } from '@/components/dashboard/enterprise-nav'
import { getUserPermissions } from '@/lib/types/family'
import type { FamilyMember } from '@/lib/types/family'

/**
 * 🏠 Dashboard layout
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

  // Fetch family context for role-based navigation
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let familyContext = null
  if (familyMember) {
    const permissions = getUserPermissions(familyMember as FamilyMember)
    familyContext = {
      role: familyMember.role,
      permissions,
      relationship: familyMember.relationship,
      display_name: familyMember.display_name
    }
  }

  return (
    <div className="min-h-screen">
      <EnterpriseNav profile={profile} familyContext={familyContext} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

