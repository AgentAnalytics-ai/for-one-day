'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

export interface Child {
  id: string
  child_name: string
  email_address: string
  photo_url: string | null
  created_at: string
}

interface ChildrenManagerProps {
  onChildCreated?: (child: Child) => void
  showCreateButton?: boolean
}

export function ChildrenManager({ onChildCreated, showCreateButton = true }: ChildrenManagerProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    child_name: '',
    email_address: '',
    password: '',
    photo: null as File | null
  })

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('child_email_accounts')
        .select('id, child_name, email_address, photo_url, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Photos are now stored directly in child_email_accounts.photo_url
      // For backwards compatibility, check unsent_messages if photo_url is null
      const childrenWithPhotos = await Promise.all(
        (data || []).map(async (child) => {
          let photoUrl = child.photo_url || null
          
          // Backwards compatibility: if no photo_url, check unsent_messages
          if (!photoUrl) {
            const { data: messageData } = await supabase
              .from('unsent_messages')
              .select('child_photo_url')
              .eq('child_email_account_id', child.id)
              .not('child_photo_url', 'is', null)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            
            photoUrl = messageData?.child_photo_url || null
            
            // If found in messages, update the child record for future use
            if (photoUrl) {
              await supabase
                .from('child_email_accounts')
                .update({ photo_url: photoUrl })
                .eq('id', child.id)
            }
          }
          
          return {
            ...child,
            photo_url: photoUrl
          }
        })
      )

      setChildren(childrenWithPhotos)
    } catch (error) {
      console.error('Error loading children:', error)
      toast.error('Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `children/${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('vault')
        .upload(fileName, file, { upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('vault')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.child_name || !formData.email_address || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in')
        setSubmitting(false)
        return
      }

      // Upload photo if provided
      let photoUrl: string | null = null
      if (formData.photo) {
        photoUrl = await handlePhotoUpload(formData.photo)
      }

      // Create child email account with photo URL
      const passwordEncrypted = btoa(formData.password)

      const { data: childData, error } = await supabase
        .from('child_email_accounts')
        .insert({
          user_id: user.id,
          child_name: formData.child_name.trim(),
          email_address: formData.email_address.trim().toLowerCase(),
          password_encrypted: passwordEncrypted,
          photo_url: photoUrl // Store photo URL directly with child profile
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Child profile created successfully')
      setFormData({ child_name: '', email_address: '', password: '', photo: null })
      setShowForm(false)
      await loadChildren()
      
      if (onChildCreated && childData) {
        onChildCreated({
          id: childData.id,
          child_name: childData.child_name,
          email_address: childData.email_address,
          photo_url: photoUrl,
          created_at: childData.created_at
        })
      }
    } catch (error) {
      console.error('Error creating child:', error)
      let message = 'Failed to create child profile'
      
      if (error instanceof Error) {
        message = error.message
        if (message.includes('duplicate') || message.includes('unique')) {
          message = 'A child with this email already exists'
        }
      }
      
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this child profile?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('child_email_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Child profile deleted')
      loadChildren()
    } catch (error) {
      console.error('Error deleting child:', error)
      toast.error('Failed to delete child profile')
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Children Profiles
          </h3>
          <p className="text-sm text-gray-600">
            Add your children with photos and email accounts. Use these when creating messages.
          </p>
        </div>
        {showCreateButton && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Add Child
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child&apos;s Name *
              </label>
              <input
                type="text"
                value={formData.child_name}
                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sarah"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sarah@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
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
                  setFormData({ child_name: '', email_address: '', password: '', photo: null })
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
        </div>
      )}

      {/* Children List */}
      {children.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Saved Children</h4>
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4"
            >
              {child.photo_url ? (
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={child.photo_url}
                    alt={child.child_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-semibold">
                    {child.child_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{child.child_name}</div>
                <div className="text-sm text-gray-600 truncate">{child.email_address}</div>
              </div>
              <button
                onClick={() => handleDelete(child.id)}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

