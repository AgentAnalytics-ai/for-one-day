'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ToastContainer } from '@/components/ui/toast'
import { toast } from '@/lib/toast'

interface FamilyMember {
  id: string
  name: string
  email: string
  relationship: string
  role: 'spouse' | 'executor' | 'family'
  has_account: boolean
  access_level: 'view' | 'edit' | 'full'
}

interface SharedLegacyNote {
  id: string
  title: string
  content: string
  shared_by: string
  shared_at: string
  access_level: 'view' | 'edit'
}

export default function FamilyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [sharedNotes, setSharedNotes] = useState<SharedLegacyNote[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Set up toast subscription
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadFamilyMembers()
      loadSharedNotes()
    }
  }, [user])

  const loadFamilyMembers = async () => {
    try {
      const response = await fetch('/api/family/members')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFamilyMembers(data.members)
        }
      }
    } catch (error) {
      console.error('Error loading family members:', error)
      toast.error('Failed to load family members')
    }
  }

  const loadSharedNotes = async () => {
    try {
      const response = await fetch('/api/family/shared-notes')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSharedNotes(data.notes)
        }
      }
    } catch (error) {
      console.error('Error loading shared notes:', error)
      toast.error('Failed to load shared notes')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading family connections...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
            Family Connections
          </h1>
          <p className="text-gray-600">
            Share your legacy with trusted family members
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {familyMembers.length}
            </div>
            <div className="text-sm text-gray-600">Family Members</div>
          </PremiumCard>
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {familyMembers.filter(member => member.has_account).length}
            </div>
            <div className="text-sm text-gray-600">With Accounts</div>
          </PremiumCard>
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {sharedNotes.length}
            </div>
            <div className="text-sm text-gray-600">Shared Notes</div>
          </PremiumCard>
        </div>

        {/* Invite Family */}
        <PremiumCard className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Invite Family Members
            </h2>
            <p className="text-gray-600 mb-6">
              Share your legacy with your spouse, children, or other trusted family members
            </p>
            <PremiumButton
              onClick={() => setShowInviteModal(true)}
              size="lg"
              className="px-8"
            >
              Invite Family Member
            </PremiumButton>
          </div>
        </PremiumCard>

        {/* Family Members */}
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Family Members</h2>
          {familyMembers.length === 0 ? (
            <PremiumCard className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No family members yet
              </h3>
              <p className="text-gray-600 mb-4">
                Invite your spouse, children, or other family members to share in your legacy
              </p>
              <PremiumButton onClick={() => setShowInviteModal(true)}>
                Invite Your First Family Member
              </PremiumButton>
            </PremiumCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member) => (
                <PremiumCard key={member.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {member.relationship} • {member.role}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.has_account ? (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Has Account
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Invited
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PremiumButton size="sm" variant="secondary">
                      View Access
                    </PremiumButton>
                    <PremiumButton size="sm" variant="secondary">
                      Edit Permissions
                    </PremiumButton>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </div>

        {/* Shared Notes */}
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Shared Legacy Notes</h2>
          {sharedNotes.length === 0 ? (
            <PremiumCard className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No shared notes yet
              </h3>
              <p className="text-gray-600 mb-4">
                Share your legacy notes with family members to preserve your wisdom together
              </p>
              <PremiumButton onClick={() => window.location.href = '/vault'}>
                Go to Legacy Vault
              </PremiumButton>
            </PremiumCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sharedNotes.map((note) => (
                <PremiumCard key={note.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {note.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(note.shared_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Shared by: {note.shared_by}
                    </p>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {note.access_level}
                    </span>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteFamilyModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            loadFamilyMembers()
            toast.success('Family member invited successfully!')
          }}
        />
      )}
    </>
  )
}

// Invite Family Modal Component
function InviteFamilyModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('spouse')
  const [role, setRole] = useState('family')
  const [sending, setSending] = useState(false)

  const handleSendInvite = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          relationship,
          role
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send invite')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      toast.error('Failed to send invite')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">
              Invite Family Member
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter family member's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="family">Family Member</option>
                <option value="executor">Executor</option>
                <option value="spouse">Spouse</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <PremiumButton
              onClick={handleSendInvite}
              disabled={sending || !name.trim() || !email.trim()}
            >
              {sending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  )
}