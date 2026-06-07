'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfileSettingsView } from '@/components/settings/profile-settings-view'
import { HouseholdSettings } from '@/components/settings/household-settings'
import { SubscriptionManagement } from '@/components/settings/subscription-management'
import { AccountManagement } from '@/components/settings/account-management'
import { SupportContactButton } from '@/components/support-contact-button'
import { ToastContainer, Toast } from '@/components/ui/toast'
import { toast } from '@/lib/toast'
import { PageHeader } from '@/components/ui/page-header'

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

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <div className="mb-5">
        <h2 className="section-title">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-500 max-w-lg">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/**
 * Settings — expert IA: Household → Profile/Legacy → Billing → Account → Support
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
        <div className="space-y-6">
          <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse mx-auto" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-100 p-8">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      <PageHeader
        className="mb-8"
        align="center"
        eyebrow={
          <>
            <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-primary-900">Settings</span>
          </>
        }
        title="Settings"
        subtitle="Household, your profile, and billing — kept separate on purpose."
      />

      <div className="space-y-6 sm:space-y-8">
        <SettingsSection
          title="Household"
          description="Your home hub — who shares daily planning and Pro. Not the same as memory recipients."
        >
          <HouseholdSettings />
        </SettingsSection>

        <SettingsSection
          id="profile"
          title="Your profile & legacy"
          description="About you, plus emergency and executor contacts for keepsakes — personal, not shared on the wall."
        >
          <ProfileSettingsView profile={profile} onUpdate={loadProfile} />
        </SettingsSection>

        <SettingsSection
          id="billing"
          title="Plan & billing"
          description="One subscription per household. Members inherit Pro without a separate charge."
        >
          <SubscriptionManagement />
        </SettingsSection>

        <SettingsSection title="Account">
          <AccountManagement profile={profile} />
        </SettingsSection>

        <SettingsSection title="Support">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Questions, billing help, or urgent family access requests.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SupportContactButton />
              <p className="text-xs text-gray-500">
                Mon–Fri 9am–6pm CST · typically within 24 hours
              </p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
