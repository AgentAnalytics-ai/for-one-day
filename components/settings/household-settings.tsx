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
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E7E2DA] border-t-primary-800" />
      </div>
    )
  }

  if (!household) {
    return (
      <div className="surface-inset border-dashed p-8 text-center text-sm text-[#5C6478]">
        {error ?? 'Household not available yet.'}
      </div>
    )
  }

  return (
    <div id="household" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubscriptionBadge tier={household.plan} />
        <p className="text-xs text-[#5C6478]">
          {household.members.length === 1 ? '1 person' : `${household.members.length} people`}{' '}
          · one bill
        </p>
      </div>

      <div className="surface-inset p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6478]">
          <Home className="h-3.5 w-3.5 text-accent-700" aria-hidden />
          Household name
        </div>

        {isEditing && household.isOwner ? (
          <div className="space-y-3">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={80}
              className="field-input text-base"
              autoFocus
            />
            {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary gap-1.5">
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
                className="btn-secondary gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-xl font-medium text-primary-900">{household.name}</p>
            {household.isOwner ? (
              <button
                type="button"
                onClick={() => {
                  setDraftName(household.name)
                  setIsEditing(true)
                }}
                className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900">
          <Users className="h-4 w-4 text-[#5C6478]" aria-hidden />
          People with logins
        </h4>
        <p className="mb-3 text-xs leading-relaxed text-[#5C6478]">
          Kids and grandparents without logins → add in{' '}
          <span className="font-medium text-primary-900">Memories</span>, not here.
        </p>
        <ul className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white">
          {household.members.map((member, i) => (
            <li
              key={member.userId}
              className={`settings-row rounded-none border-0 border-b border-[#F0EBE3] ${
                i === household.members.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <span className="font-medium text-primary-900">
                {member.fullName || 'Member'}
                {member.isYou ? (
                  <span className="ml-2 text-xs font-normal text-[#5C6478]">(you)</span>
                ) : null}
              </span>
              <span className="rounded-full bg-[#E8EEF4] px-2.5 py-0.5 text-xs font-semibold text-primary-800">
                {formatRole(member.role)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {household.pendingInvitations.length > 0 ? (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900">
            <Clock className="h-4 w-4 text-accent-700" aria-hidden />
            Pending invites
          </h4>
          <ul className="space-y-2">
            {household.pendingInvitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent-200/80 bg-accent-50/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-primary-900">{inv.invitedEmail}</p>
                  <p className="text-xs text-[#5C6478]">
                    {formatRole(inv.role)} · expires {formatExpiry(inv.expiresAt)}
                  </p>
                </div>
                {household.isOwner ? (
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(inv.id)}
                    disabled={cancellingId === inv.id}
                    className="text-xs font-semibold text-[#5C6478] hover:text-primary-900 disabled:opacity-50"
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
        <div className="rounded-xl border border-[#E7E2DA] bg-gradient-to-b from-white to-[#FAF7F2]/40 p-5">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary-900">
            <Mail className="h-4 w-4 text-accent-700" aria-hidden />
            Invite to household
          </h4>
          <p className="mb-4 text-xs leading-relaxed text-[#5C6478]">
            Email them a link to join your home. Solo free accounts merge in automatically.
            Pro covers everyone here — no per-person charge.
          </p>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="invite-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5C6478]">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@email.com"
                required
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5C6478]">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as InvitableHouseholdRole)}
                className="field-input"
              >
                {INVITABLE_HOUSEHOLD_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {inviteRoleLabel(r)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#5C6478]">{inviteRoleDescription(inviteRole)}</p>
            </div>
            {inviteError ? <p className="text-sm text-red-700">{inviteError}</p> : null}
            {inviteSuccess ? (
              <p className="text-sm font-medium text-[#0F5132]">Invitation sent — check their inbox.</p>
            ) : null}
            <button type="submit" disabled={inviting} className="btn-primary">
              {inviting ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        </div>
      ) : null}

      {!household.isOwner ? (
        <p className="text-xs text-[#5C6478]">
          You&apos;re a member. Pro and billing are managed by the household owner.
        </p>
      ) : null}

      {household.isOwner && !household.canInvite ? (
        <p className="text-xs text-[#5C6478]">
          Member limit reached. Cancel a pending invite to add someone else.
        </p>
      ) : null}
    </div>
  )
}
