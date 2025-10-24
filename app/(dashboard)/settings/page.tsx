import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form'
import { SubscriptionManagement } from '@/components/settings/subscription-management'
import { AccountManagement } from '@/components/settings/account-management'
import { FunctionalityTest } from '@/components/settings/functionality-test'

/**
 * ⚙️ Settings Page - User Profile & Emergency Contact
 * Simple, professional settings interface
 */
export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile with emergency contact info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-light text-gray-900 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">
          Manage your profile and emergency contact information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProfileSettingsForm profile={profile} />
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Subscription Management</h2>
        <SubscriptionManagement />
      </div>

      {/* Account Management */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Account Management</h2>
        <AccountManagement profile={profile} />
      </div>

      {/* Expert Functionality Test */}
      <div className="mt-8">
        <FunctionalityTest />
      </div>

      {/* Emergency Contact Info */}
      <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Emergency Access
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              If something happens to you, your emergency contact can request access to your legacy notes. 
              This helps ensure your family receives your important messages.
            </p>
            <div className="text-blue-700 text-sm">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Your emergency contact emails our support team</li>
                <li>We verify their identity and relationship to you</li>
                <li>We securely deliver your legacy notes to them</li>
                <li>This process typically takes 1-2 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
