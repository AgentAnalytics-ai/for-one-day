'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'
import {
  cropFileToSquareJpeg,
  uploadProfilePhotoBlob,
  validateProfileImageFile,
} from '@/lib/profile-photo'
import { ProfileAvatar, ProfilePhotoField } from '@/components/settings/profile-photo-field'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [photoToRemove, setPhotoToRemove] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [formData, setFormData] = useState({
    child_name: '',
    email_address: '',
    password: '',
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

  const revokePreview = useCallback(() => {
    setPhotoPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setPhotoBlob(null)
  }, [])

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setPhotoToRemove(false)
    setFormData({ child_name: '', email_address: '', password: '' })
    revokePreview()
  }

  const startCreate = () => {
    setEditingId(null)
    setPhotoToRemove(false)
    setFormData({ child_name: '', email_address: '', password: '' })
    revokePreview()
    setShowForm(true)
  }

  const startEdit = (child: Child) => {
    setEditingId(child.id)
    setFormData({
      child_name: child.child_name,
      email_address: child.email_address,
      password: '',
    })
    setPhotoToRemove(false)
    setPhotoPreview(null)
    setPhotoBlob(null)
    setShowForm(true)
  }

  const handlePickPhoto = async (file: File) => {
    const err = validateProfileImageFile(file)
    if (err) {
      toast.error(err)
      return
    }
    try {
      const blob = await cropFileToSquareJpeg(file)
      setPhotoToRemove(false)
      revokePreview()
      const preview = URL.createObjectURL(blob)
      setPhotoPreview(preview)
      setPhotoBlob(blob)
    } catch (e) {
      console.error(e)
      toast.error('Could not process that image. Try another file.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.child_name?.trim() || !formData.email_address?.trim()) {
      toast.error('Please fill in name and email')
      return
    }
    if (!editingId && !formData.password) {
      toast.error('Password is required for a new child profile')
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

      let photoStoragePath: string | null | undefined
      if (photoBlob) {
        const path = await uploadProfilePhotoBlob(photoBlob, 'children')
        if (!path) {
          toast.error('Could not upload photo. Please try again.')
          setSubmitting(false)
          return
        }
        photoStoragePath = path
      }

      if (editingId) {
        const updatePayload: {
          child_name: string
          email_address: string
          password_encrypted?: string
          photo_url?: string | null
        } = {
          child_name: formData.child_name.trim(),
          email_address: formData.email_address.trim().toLowerCase(),
        }
        if (formData.password.trim()) {
          updatePayload.password_encrypted = btoa(formData.password)
        }
        if (photoStoragePath) {
          updatePayload.photo_url = photoStoragePath
        } else if (photoToRemove) {
          updatePayload.photo_url = null
        }

        const { error } = await supabase
          .from('child_email_accounts')
          .update(updatePayload)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Child profile updated')
        cancelForm()
        await loadChildren()
        setSubmitting(false)
        return
      }

      const passwordEncrypted = btoa(formData.password)

      const insertData: {
        user_id: string
        child_name: string
        email_address: string
        password_encrypted: string
        photo_url?: string
      } = {
        user_id: user.id,
        child_name: formData.child_name.trim(),
        email_address: formData.email_address.trim().toLowerCase(),
        password_encrypted: passwordEncrypted,
      }

      if (photoStoragePath) {
        insertData.photo_url = photoStoragePath
      }

      const { data: childData, error } = await supabase
        .from('child_email_accounts')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating child:', error)
        throw error
      }

      toast.success('Child profile created successfully' + (photoStoragePath ? ' with photo.' : ''))
      cancelForm()

      await loadChildren()

      if (onChildCreated && childData) {
        onChildCreated({
          id: childData.id,
          child_name: childData.child_name,
          email_address: childData.email_address,
          photo_url: photoStoragePath ?? null,
          created_at: childData.created_at,
        })
      }
    } catch (error) {
      console.error('Error saving child:', error)
      let message = editingId ? 'Failed to update child profile' : 'Failed to create child profile'

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

  const editingChild = useMemo(
    () => (editingId ? children.find((c) => c.id === editingId) : undefined),
    [children, editingId]
  )

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
            type="button"
            onClick={startCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Add Child
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit child' : 'Add a child'}
          </h4>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              {editingChild?.photo_url && !photoBlob && !photoToRemove && (
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <ProfileAvatar photoRef={editingChild.photo_url} name={editingChild.child_name} />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setPhotoToRemove(true)}
                    className="text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              )}
              {photoToRemove && (
                <p className="mb-2 text-xs text-amber-700">Current photo will be removed when you save.</p>
              )}
              <ProfilePhotoField
                previewUrl={photoPreview}
                disabled={submitting}
                onPickFile={handlePickPhoto}
                onClear={revokePreview}
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
                Password{editingId ? '' : ' *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={editingId ? 'Leave blank to keep current password' : 'Enter password'}
                required={!editingId}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editingId
                  ? 'Only fill this if you want to change the stored password.'
                  : 'Stored securely for your account only.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
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
              <ProfileAvatar photoRef={child.photo_url} name={child.child_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{child.child_name}</div>
                <div className="text-sm text-gray-600 truncate">{child.email_address}</div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(child)}
                  className="rounded-md px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(child.id)}
                  className="rounded-md px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
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

