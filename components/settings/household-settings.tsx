'use client'

import { useCallback, useEffect, useState } from 'react'
import { Home, Users, Pencil, Check, X } from 'lucide-react'
import {
  getHouseholdSettings,
  updateHouseholdName,
  type HouseholdSettings,
} from '@/app/actions/household-actions'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'

function formatRole(role: string): string {
  if (role === 'owner') return 'Owner'
  if (role === 'spouse') return 'Spouse'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function HouseholdSettings() {
  const [household, setHousehold] = useState<HouseholdSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getHouseholdSettings()
    if (result.success && result.household) {
      setHousehold(result.household)
      setDraftName(result.household.name)
    } else {
      setHousehold(null)
      setError(result.error ?? 'Unable to load household')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (!household) return
    setSaving(true)
    setSaveError(null)
    const result = await updateHouseholdName(draftName)
    if (result.success && result.name) {
      setHousehold({ ...household, name: result.name })
      setIsEditing(false)
    } else {
      setSaveError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!household) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
        {error ?? 'Household not available yet.'}
      </div>
    )
  }

  return (
    <div id="household" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="card-heading">Your household</h3>
          <p className="text-sm text-gray-600">
            Shared home for daily planning — billing and Pro apply here.
          </p>
        </div>
        <SubscriptionBadge tier={household.plan} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          <Home className="h-3.5 w-3.5" />
          Household name
        </div>

        {isEditing && household.isOwner ? (
          <div className="space-y-3">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={80}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-primary-600"
              autoFocus
            />
            {saveError ? (
              <p className="text-sm text-red-600">{saveError}</p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftName(household.name)
                  setIsEditing(false)
                  setSaveError(null)
                }}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-gray-900">{household.name}</p>
            {household.isOwner ? (
              <button
                type="button"
                onClick={() => {
                  setDraftName(household.name)
                  setIsEditing(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Users className="h-4 w-4 text-gray-600" />
          Members
        </h4>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {household.members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="font-medium text-gray-900">
                {member.fullName || 'Member'}
                {member.isYou ? (
                  <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>
                ) : null}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                {formatRole(member.role)}
              </span>
            </li>
          ))}
        </ul>
        {household.isOwner ? (
          <p className="mt-2 text-xs text-gray-500">
            Spouse invites — Step 5. One household, one Pro subscription.
          </p>
        ) : null}
      </div>
    </div>
  )
}
