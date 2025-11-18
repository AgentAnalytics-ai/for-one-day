'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'
import { ChildrenManager, Child } from '@/components/settings/children-manager'

interface UnsentMessage {
  id: string
  child_name: string
  child_photo_url: string | null
  message_content: string
  message_title: string | null
  scheduled_send_date: string | null
  status: 'draft' | 'scheduled' | 'sent'
  child_email_account_id: string | null
  created_at: string
}

export function UnsentMessagesBox() {
  const [messages, setMessages] = useState<UnsentMessage[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showChildrenManager, setShowChildrenManager] = useState(false)
  const [formData, setFormData] = useState({
    child_id: '',
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

      // Load children
      const { data: childrenData } = await supabase
        .from('child_email_accounts')
        .select('id, child_name, email_address, created_at')
        .order('created_at', { ascending: false })

      // Load photos for children
      const childrenWithPhotos = await Promise.all(
        (childrenData || []).map(async (child) => {
          const { data: messageData } = await supabase
            .from('unsent_messages')
            .select('child_photo_url')
            .eq('child_name', child.child_name)
            .not('child_photo_url', 'is', null)
            .limit(1)
            .single()
          
          return {
            id: child.id,
            child_name: child.child_name,
            email_address: child.email_address,
            photo_url: messageData?.child_photo_url || null,
            created_at: child.created_at
          }
        })
      )

      setMessages(messagesData || [])
      setChildren(childrenWithPhotos)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.child_id || !formData.message_content) {
      toast.error('Please select a child and write a message')
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedChild = children.find(c => c.id === formData.child_id)
      if (!selectedChild) {
        toast.error('Selected child not found')
        return
      }

      const { error } = await supabase
        .from('unsent_messages')
        .insert({
          user_id: user.id,
          child_email_account_id: selectedChild.id,
          child_name: selectedChild.child_name,
          child_photo_url: selectedChild.photo_url,
          message_content: formData.message_content,
          message_title: formData.message_title || `A Letter for ${selectedChild.child_name}`,
          status: 'draft'
        })

      if (error) throw error

      toast.success('Message saved! You can send it when ready.')
      setFormData({ child_id: '', message_title: '', message_content: '' })
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
            Write messages to your children. Send them when ready via their email accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChildrenManager(!showChildrenManager)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {showChildrenManager ? 'Hide' : 'Manage'} Children
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={children.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Message
          </button>
        </div>
      </div>

      {/* Children Manager */}
      {showChildrenManager && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ChildrenManager 
            onChildCreated={() => {
              loadData()
              setShowChildrenManager(false)
            }}
          />
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No children added yet.</p>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setShowChildrenManager(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Child
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Child *
                </label>
                <select
                  value={formData.child_id}
                  onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a child...</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.child_name} {child.email_address ? `(${child.email_address})` : ''}
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
                  setFormData({ child_id: '', message_title: '', message_content: '' })
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
          <p className="text-gray-600 mb-4">Create your first message to a child</p>
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
            const child = children.find(c => c.id === message.child_email_account_id)
            const hasEmail = !!child

            return (
              <div
                key={message.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Header with Photo */}
                <div className="flex items-start gap-4 mb-4">
                  {message.child_photo_url ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={message.child_photo_url}
                        alt={message.child_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-semibold">
                        {message.child_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {message.child_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {hasEmail ? (
                        <>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Email Created
                          </span>
                          <span className="text-xs text-gray-500">
                            {child?.email_address}
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
                    {message.message_title || `A Letter for ${message.child_name}`}
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
                    ✉️ This will be sent to {hasEmail ? child?.email_address : 'their email (add child profile first)'}
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

