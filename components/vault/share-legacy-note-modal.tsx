'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'
import { X } from 'lucide-react'

interface EmailAccount {
  id: string
  child_name: string
  email_address: string
}

interface ShareLegacyNoteModalProps {
  isOpen: boolean
  onClose: () => void
  vaultItem: {
    id: string
    title: string
    metadata?: {
      content?: string
      attachments?: Array<{ storage_path: string; type: string }>
    }
  }
}

export function ShareLegacyNoteModal({ isOpen, onClose, vaultItem }: ShareLegacyNoteModalProps) {
  const [childEmails, setChildEmails] = useState<EmailAccount[]>([])
  const [selectedEmail, setSelectedEmail] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [useSavedEmail, setUseSavedEmail] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch child emails on mount
  useEffect(() => {
    if (isOpen) {
      loadChildEmails()
    } else {
      // Reset form when modal closes
      setSelectedEmail('')
      setManualEmail('')
      setUseSavedEmail(true)
    }
  }, [isOpen])

  const loadChildEmails = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('child_email_accounts')
        .select('id, child_name, email_address')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setChildEmails(data || [])
    } catch (error) {
      console.error('Error loading child emails:', error)
      // Don't show error toast - just continue without saved emails
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    const recipientEmail = useSavedEmail ? selectedEmail : manualEmail.trim()
    
    if (!recipientEmail) {
      toast.error('Please select or enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/vault/share-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_item_id: vaultItem.id,
          recipient_email: recipientEmail
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      toast.success('Legacy note shared successfully!')
      onClose()
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to share legacy note')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  const recipientEmail = useSavedEmail ? selectedEmail : manualEmail

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900">Share Legacy Note</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sharing: <span className="font-medium text-gray-900">{vaultItem.title}</span></p>
        </div>
        
        {/* Email Selection */}
        <div className="space-y-4 mb-6">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading saved emails...</div>
          ) : childEmails.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from saved emails
              </label>
              <select
                value={useSavedEmail ? selectedEmail : ''}
                onChange={(e) => {
                  setSelectedEmail(e.target.value)
                  setUseSavedEmail(true)
                  setManualEmail('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a saved email...</option>
                {childEmails.map(account => (
                  <option key={account.id} value={account.email_address}>
                    {account.child_name} ({account.email_address})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {childEmails.length > 0 && (
            <div className="text-center text-gray-500 text-sm">OR</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {childEmails.length > 0 ? 'Enter email address' : 'Email address'}
            </label>
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => {
                setManualEmail(e.target.value)
                setUseSavedEmail(false)
                setSelectedEmail('')
              }}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !recipientEmail}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

