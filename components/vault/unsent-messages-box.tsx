'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'
import { LovedOnesManager, LovedOne } from '@/components/settings/loved-ones-manager'

interface UnsentMessage {
  id: string
  recipient_name: string
  recipient_photo_url: string | null
  message_content: string
  message_title: string | null
  scheduled_send_date: string | null
  status: 'draft' | 'scheduled' | 'sent'
  loved_one_id: string | null
  created_at: string
}

export function UnsentMessagesBox() {
  const [messages, setMessages] = useState<UnsentMessage[]>([])
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showLovedOnesManager, setShowLovedOnesManager] = useState(false)
  const [formData, setFormData] = useState({
    loved_one_id: '',
    message_title: '',
    message_content: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load unsent messages
      const { data: messagesData } = await supabase
        .from('unsent_messages')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })

      // Load loved ones with photos (photos now stored directly in loved_ones)
      const { data: lovedOnesData } = await supabase
        .from('loved_ones')
        .select('id, recipient_name, email_address, photo_url, created_at')
        .order('created_at', { ascending: false })

      // For backwards compatibility, check unsent_messages if photo_url is null
      const lovedOnesWithPhotos = await Promise.all(
        (lovedOnesData || []).map(async (lovedOne) => {
          let photoUrl = lovedOne.photo_url || null
          
          // Backwards compatibility: if no photo_url, check unsent_messages
          if (!photoUrl) {
            const { data: messageData } = await supabase
              .from('unsent_messages')
              .select('recipient_photo_url')
              .eq('loved_one_id', lovedOne.id)
              .not('recipient_photo_url', 'is', null)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            
            photoUrl = messageData?.recipient_photo_url || null
            
            // If found in messages, update the loved one record
            if (photoUrl) {
              await supabase
                .from('loved_ones')
                .update({ photo_url: photoUrl })
                .eq('id', lovedOne.id)
            }
          }
          
          return {
            id: lovedOne.id,
            recipient_name: lovedOne.recipient_name,
            email_address: lovedOne.email_address,
            photo_url: photoUrl,
            created_at: lovedOne.created_at
          }
        })
      )

      setMessages(messagesData || [])
      setLovedOnes(lovedOnesWithPhotos)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.loved_one_id || !formData.message_content) {
      toast.error('Please select a loved one and write a message')
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedLovedOne = lovedOnes.find(l => l.id === formData.loved_one_id)
      if (!selectedLovedOne) {
        toast.error('Selected loved one not found')
        return
      }

      const { error } = await supabase
        .from('unsent_messages')
        .insert({
          user_id: user.id,
          loved_one_id: selectedLovedOne.id,
          recipient_name: selectedLovedOne.recipient_name,
          recipient_photo_url: selectedLovedOne.photo_url, // Use photo from loved one profile
          message_content: formData.message_content,
          message_title: formData.message_title || `A Letter for ${selectedLovedOne.recipient_name}`,
          status: 'draft'
        })

      if (error) throw error

      toast.success('Message saved! You can send it when ready.')
      setFormData({ loved_one_id: '', message_title: '', message_content: '' })
      setShowCreateForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating message:', error)
      toast.error('Failed to save message')
    }
  }

  const handleSendMessage = async (messageId: string) => {
    if (!confirm('Send this message now? It will be emailed immediately.')) return

    try {
      const response = await fetch('/api/vault/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast.success('Message sent! ✉️')
      loadData()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this unsent message?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('unsent_messages')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Message deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Unsent Messages
          </h2>
          <p className="text-sm text-gray-600">
            Write messages to your loved ones (spouse, children, family, friends). Send them when ready via their email accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLovedOnesManager(!showLovedOnesManager)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {showLovedOnesManager ? 'Hide' : 'Manage'} Loved Ones
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={lovedOnes.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Message
          </button>
        </div>
      </div>

      {/* Loved Ones Manager */}
      {showLovedOnesManager && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <LovedOnesManager 
            onLovedOneCreated={() => {
              loadData()
              setShowLovedOnesManager(false)
            }}
          />
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          {lovedOnes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No loved ones added yet.</p>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setShowLovedOnesManager(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Loved One
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loved One *
                </label>
                <select
                  value={formData.loved_one_id}
                  onChange={(e) => setFormData({ ...formData, loved_one_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a loved one...</option>
                  {lovedOnes.map((lovedOne) => (
                    <option key={lovedOne.id} value={lovedOne.id}>
                      {lovedOne.recipient_name} {lovedOne.email_address ? `(${lovedOne.email_address})` : ''}
                    </option>
                  ))}
                </select>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Title (Optional)
              </label>
              <input
                type="text"
                value={formData.message_title}
                onChange={(e) => setFormData({ ...formData, message_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., A Letter for Your Wedding Day"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={formData.message_content}
                onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
                placeholder="Write your message here..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({ loved_one_id: '', message_title: '', message_content: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Message
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 && !showCreateForm ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Unsent Messages</h3>
          <p className="text-gray-600 mb-4">Create your first message to a loved one</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Message
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((message) => {
            const lovedOne = lovedOnes.find(l => l.id === message.loved_one_id)
            const hasEmail = !!lovedOne

            return (
              <div
                key={message.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Header with Photo */}
                <div className="flex items-start gap-4 mb-4">
                  {message.recipient_photo_url ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={message.recipient_photo_url}
                        alt={message.recipient_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-semibold">
                        {message.recipient_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {message.recipient_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {hasEmail ? (
                        <>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Email Created
                          </span>
                          <span className="text-xs text-gray-500">
                            {lovedOne?.email_address}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          ⚠ No Email Account
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {message.message_title || `A Letter for ${message.recipient_name}`}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {message.message_content}
                    </p>
                  </div>
                </div>

                {/* Preview Badge */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800 font-medium">
                    ✉️ This will be sent to {hasEmail ? lovedOne?.email_address : 'their email (add loved one profile first)'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {hasEmail ? (
                    <button
                      onClick={() => handleSendMessage(message.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Send Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm font-medium"
                    >
                      Create Email First
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

