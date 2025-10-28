'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ToastContainer } from '@/components/ui/toast'
import { toast } from '@/lib/toast'
import { Users, UserPlus, Share2, Calendar, Mail } from 'lucide-react'

interface FamilyMember {
  user_id: string
  full_name: string
  email: string
  role: string
  invitation_status: string
  joined_at: string
  invited_at: string
}

export default function FamilyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [sharedNotesCount, setSharedNotesCount] = useState(0)
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
      loadFamilyData()
    }
  }, [user])

  const loadFamilyData = async () => {
    try {
      // Load family members
      const membersResponse = await fetch('/api/family/members')
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        if (membersData.success) {
          setFamilyMembers(membersData.members || [])
        }
      }

      // Load shared notes count
      const notesResponse = await fetch('/api/family/shared-notes')
      if (notesResponse.ok) {
        const notesData = await notesResponse.json()
        if (notesData.success) {
          setSharedNotesCount(notesData.notes?.length || 0)
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error)
      toast.error('Failed to load family data')
    }
  }

  const handleInviteSuccess = () => {
    setShowInviteModal(false)
    loadFamilyData()
    toast.success('Invitation sent successfully!')
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

  const hasFamilyMembers = familyMembers.length > 0
  const hasSharedNotes = sharedNotesCount > 0

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {familyMembers.length}
            </div>
            <div className="text-sm text-gray-600">Family Members</div>
          </PremiumCard>
          
          <PremiumCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {familyMembers.filter(member => member.invitation_status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600">With Accounts</div>
          </PremiumCard>
          
          <PremiumCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Share2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {sharedNotesCount}
            </div>
            <div className="text-sm text-gray-600">Shared Notes</div>
          </PremiumCard>
        </div>

        {/* Single Action Section - Only show when no family members */}
        {!hasFamilyMembers && (
          <PremiumCard className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Start Building Your Family Legacy
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Invite your spouse, children, or trusted family members to share in your legacy journey
            </p>
            <PremiumButton
              onClick={() => setShowInviteModal(true)}
              size="lg"
              className="px-8"
            >
              Invite Family Member
            </PremiumButton>
          </PremiumCard>
        )}

        {/* Family Members Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900">Family Members</h2>
            {hasFamilyMembers && (
              <PremiumButton
                onClick={() => setShowInviteModal(true)}
                size="sm"
                variant="secondary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </PremiumButton>
            )}
          </div>

          {!hasFamilyMembers ? (
            <PremiumCard className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
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
                <PremiumCard key={member.user_id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {member.full_name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 capitalize">
                        {member.role}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        {member.email}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {member.invitation_status === 'accepted' 
                          ? `Joined ${new Date(member.joined_at).toLocaleDateString()}`
                          : `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                    <div className="flex items-center">
                      {member.invitation_status === 'accepted' ? (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PremiumButton size="sm" variant="secondary">
                      View Access
                    </PremiumButton>
                    <PremiumButton size="sm" variant="secondary">
                      Manage
                    </PremiumButton>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </div>

        {/* Shared Notes Section - Only show if there are shared notes */}
        {hasSharedNotes && (
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Shared Legacy Notes</h2>
            <PremiumCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sharedNotesCount} Shared Notes
              </h3>
              <p className="text-gray-600 mb-4">
                Your family can access these legacy notes in their vault
              </p>
              <PremiumButton onClick={() => window.location.href = '/vault'}>
                View in Legacy Vault
              </PremiumButton>
            </PremiumCard>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteFamilyModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
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
  const [role, setRole] = useState('spouse')
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
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
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="viewer">Viewer</option>
                <option value="executor">Executor</option>
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