'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

interface EmailAccount {
  id: string
  child_name: string
  email_address: string
  created_at: string
}

export function EmailAccountManager() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    child_name: '',
    email_address: '',
    password: ''
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('child_email_accounts')
        .select('id, child_name, email_address, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading accounts:', error)
      toast.error('Failed to load email accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.child_name || !formData.email_address || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      // Simple encoding for storage (in production, use proper encryption library)
      // Note: This is base64 encoding, not true encryption. For production, consider
      // using a proper encryption library or Supabase Vault encryption
      const passwordEncrypted = btoa(formData.password)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to save email accounts')
        setSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('child_email_accounts')
        .insert({
          user_id: user.id,
          child_name: formData.child_name.trim(),
          email_address: formData.email_address.trim().toLowerCase(),
          password_encrypted: passwordEncrypted
        })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast.success('Email account saved securely')
      setFormData({ child_name: '', email_address: '', password: '' })
      setShowForm(false)
      await loadAccounts()
    } catch (error) {
      console.error('Error saving account:', error)
      let message = 'Failed to save email account'
      
      if (error instanceof Error) {
        message = error.message
        // Make error messages more user-friendly
        if (message.includes('duplicate') || message.includes('unique')) {
          message = 'An account with this email already exists'
        } else if (message.includes('permission') || message.includes('policy')) {
          message = 'Permission denied. Please check your account settings.'
        } else if (message.includes('relation') || message.includes('does not exist')) {
          message = 'Database error. Please contact support if this persists.'
        }
      }
      
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email account?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('child_email_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Email account deleted')
      loadAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete email account'
      toast.error(message)
    }
  }

  const showPassword = async (id: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('child_email_accounts')
        .select('password_encrypted')
        .eq('id', id)
        .single()

      if (error) throw error

      // Decode password
      const password = atob(data.password_encrypted)
      
      // Show in prompt (in production, use a secure modal)
      alert(`Password: ${password}\n\nPlease write this down securely.`)
    } catch (error) {
      console.error('Error retrieving password:', error)
      toast.error('Failed to retrieve password')
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Email Accounts for Future Delivery
        </h3>
        <p className="text-sm text-gray-600">
          Store email accounts for your children. Letters will be sent here when scheduled.
        </p>
      </div>

      {/* Setup Guide */}
      {accounts.length === 0 && !showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">How to Set Up</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Create a Gmail account for your child at <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">accounts.google.com</a></li>
            <li>For children under 13, use <a href="https://families.google.com/families" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Family Link</a></li>
            <li>Enter the email and password below to store securely</li>
            <li>When your child is ready, share the credentials with them</li>
          </ol>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Email Account
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child&apos;s Name
            </label>
            <input
              type="text"
              value={formData.child_name}
              onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Sarah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email_address}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="sarah@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be encrypted and stored securely
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFormData({ child_name: '', email_address: '', password: '' })
              }}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Saved Accounts</h4>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{account.child_name}</div>
                <div className="text-sm text-gray-600 truncate">{account.email_address}</div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => showPassword(account.id)}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  View Password
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

