'use client'

import { useCallback, useEffect, useState } from 'react'
import { Home, Users, Pencil, Check, X, Mail, Clock } from 'lucide-react'
import {
  cancelHouseholdInvitation,
  getHouseholdSettings,
  inviteHouseholdMember,
  updateHouseholdName,
  type HouseholdSettings,
} from '@/app/actions/household-actions'
import {
  INVITABLE_HOUSEHOLD_ROLES,
  inviteRoleDescription,
  inviteRoleLabel,
  type InvitableHouseholdRole,
} from '@/lib/household-invite'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'

function formatRole(role: string): string {
  if (role === 'owner') return 'Owner'
  if (role === 'spouse') return 'Partner'
  if (role === 'child') return 'Adult child'
  if (role === 'viewer') return 'Viewer'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function HouseholdSettings() {
  const [household, setHousehold] = useState<HouseholdSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<InvitableHouseholdRole>('spouse')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!household) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)
    const result = await inviteHouseholdMember(inviteEmail, inviteRole)
    if (result.success) {
      setInviteEmail('')
      setInviteSuccess(true)
      await load()
      setTimeout(() => setInviteSuccess(false), 4000)
    } else {
      setInviteError(result.error ?? 'Failed to send invite')
    }
    setInviting(false)
  }

  const handleCancelInvite = async (id: string) => {
    setCancellingId(id)
    const result = await cancelHouseholdInvitation(id)
    if (result.success) {
      await load()
    }
    setCancellingId(null)
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
    <div id="household" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Home hub
          </p>
          <p className="text-sm text-gray-600 max-w-md">
            Daily planning, billing, and who shares Pro. One household — one subscription.
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
            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
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
        <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Users className="h-4 w-4 text-gray-600" />
          People with logins
        </h4>
        <p className="mb-3 text-xs text-gray-500">
          Members share this home. For memory recipients without logins (kids, grandparents),
          add them in Memories — not here.
        </p>
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
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {formatRole(member.role)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {household.pendingInvitations.length > 0 ? (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="h-4 w-4 text-gray-600" />
            Pending invites
          </h4>
          <ul className="space-y-2">
            {household.pendingInvitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{inv.invitedEmail}</p>
                  <p className="text-xs text-gray-600">
                    {formatRole(inv.role)} · expires {formatExpiry(inv.expiresAt)}
                  </p>
                </div>
                {household.isOwner ? (
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(inv.id)}
                    disabled={cancellingId === inv.id}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {cancellingId === inv.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {household.isOwner && household.canInvite ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Mail className="h-4 w-4 text-gray-600" />
            Invite to household
          </h4>
          <p className="mb-4 text-xs text-gray-500">
            They&apos;ll get an email to join your home. Pro applies to everyone in this household
            — no extra charge per person.
          </p>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="invite-email" className="sr-only">
                  Email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="partner@email.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="invite-role" className="block text-xs font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as InvitableHouseholdRole)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                >
                  {INVITABLE_HOUSEHOLD_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {inviteRoleLabel(r)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  {inviteRoleDescription(inviteRole)}
                </p>
              </div>
            </div>
            {inviteError ? (
              <p className="text-sm text-red-600">{inviteError}</p>
            ) : null}
            {inviteSuccess ? (
              <p className="text-sm text-green-700">Invitation sent — check their inbox.</p>
            ) : null}
            <button
              type="submit"
              disabled={inviting}
              className="rounded-full bg-primary-700 px-5 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:opacity-50"
            >
              {inviting ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        </div>
      ) : null}

      {!household.isOwner ? (
        <p className="text-xs text-gray-500">
          You&apos;re a member of this household. Pro and billing are managed by the owner.
        </p>
      ) : null}

      {household.isOwner && !household.canInvite ? (
        <p className="text-xs text-gray-500">
          Member limit reached. Cancel a pending invite or contact support to add more people.
        </p>
      ) : null}
    </div>
  )
}
