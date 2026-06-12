'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarSettings } from '@/components/settings/calendar-settings'
import { ProfileSettingsView } from '@/components/settings/profile-settings-view'
import { HouseholdSettings } from '@/components/settings/household-settings'
import { SubscriptionManagement } from '@/components/settings/subscription-management'
import { AccountManagement } from '@/components/settings/account-management'
import { SignOutSection } from '@/components/settings/sign-out-section'
import { SupportContactButton } from '@/components/support-contact-button'
import {
  SettingsTabs,
  settingsTabFromHash,
  type SettingsTabId,
} from '@/components/settings/settings-tabs'
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
 * Family settings — household, profile, plan, account.
 * Memories live at /more (phone), not here.
 */
export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeTab, setActiveTab] = useState<SettingsTabId>('household')

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

  useEffect(() => {
    const syncHash = () => {
      if (typeof window === 'undefined') return
      const hash = window.location.hash
      if (hash === '#more') {
        router.replace('/more')
        return
      }
      setActiveTab(settingsTabFromHash(hash))
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [router])

  const selectTab = (id: SettingsTabId) => {
    setActiveTab(id)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="space-y-6">
          <div className="surface-card h-12 animate-pulse" />
          <div className="surface-card h-64 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pb-12">
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />

      <header className="mb-6 text-center">
        <h1 className="page-title">Family</h1>
        <p className="page-subtitle mt-1">Household, plan, and your profile.</p>
      </header>

      <SettingsTabs active={activeTab} onChange={selectTab} />

      <div className="surface-card p-5 sm:p-6">
        {activeTab === 'household' && <HouseholdSettings />}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <ProfileSettingsView profile={profile} onUpdate={loadProfile} />
            <div className="border-t border-[#F0EBE3] pt-8">
              <CalendarSettings />
            </div>
          </div>
        )}
        {activeTab === 'billing' && <SubscriptionManagement />}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <SignOutSection userName={profile?.full_name} />
            <AccountManagement profile={profile} />
            <div className="border-t border-[#F0EBE3] pt-6">
              <SupportContactButton />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#5C6478] lg:hidden">
        <span>{profile?.full_name ?? 'Signed in'}</span>
        <span aria-hidden>·</span>
        <SignOutSection variant="inline" />
      </div>
    </div>
  )
}
