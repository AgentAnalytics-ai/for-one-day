'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form'
import { SubscriptionManagement } from '@/components/settings/subscription-management'
import { AccountManagement } from '@/components/settings/account-management'
import { SupportContactButton } from '@/components/support-contact-button'
import { EmailAccountManager } from '@/components/settings/email-account-manager'
import { ToastContainer, Toast } from '@/components/ui/toast'
import { toast } from '@/lib/toast'

interface Profile {
  user_id: string
  full_name?: string
  avatar_url?: string | null
  plan: string
  created_at?: string
  updated_at?: string
  emergency_contact_email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  emergency_access_enabled?: boolean
  emergency_access_notes?: string
  executor_name?: string
  executor_email?: string
  executor_phone?: string
  executor_relationship?: string
}

/**
 * ⚙️ Settings Page - User Profile & Emergency Contact
 * Simple, professional settings interface
 */
export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-gray-900 mb-2">
          Account Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your profile and emergency contact information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <ProfileSettingsForm profile={profile} />
      </div>

      {/* Subscription Management */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Subscription Management</h2>
        <SubscriptionManagement />
      </div>

      {/* Email Accounts for Future Delivery */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <EmailAccountManager />
      </div>

      {/* Account Management */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Account Management</h2>
        <AccountManagement profile={profile} />
      </div>

      {/* Support Contact - Redesigned */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Support</h2>
        
        <div className="space-y-4">
          {/* Priority Support */}
          <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                For urgent family access requests
              </p>
              <a 
                href="tel:+14055357750"
                className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
              >
                (405) 535-7750
              </a>
              <p className="text-xs text-gray-600 mt-1">
                Mon-Fri 9am-6pm CST • Founder direct line
              </p>
            </div>
          </div>

          {/* General Support */}
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">
                General questions and support
              </p>
              <SupportContactButton />
              <p className="text-xs text-gray-600 mt-2">
                Response within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Info */}
      <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
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
