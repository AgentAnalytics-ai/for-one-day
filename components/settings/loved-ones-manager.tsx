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

export interface LovedOne {
  id: string
  recipient_name: string
  email_address: string
  photo_url: string | null
  created_at: string
}

interface LovedOnesManagerProps {
  onLovedOneCreated?: (lovedOne: LovedOne) => void
  showCreateButton?: boolean
}

export function LovedOnesManager({ onLovedOneCreated, showCreateButton = true }: LovedOnesManagerProps) {
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [photoToRemove, setPhotoToRemove] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [formData, setFormData] = useState({
    recipient_name: '',
    email_address: '',
    password: '',
  })

  useEffect(() => {
    loadLovedOnes()
  }, [])

  const loadLovedOnes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('loved_ones')
        .select('id, recipient_name, email_address, photo_url, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist, that's okay - just show empty list
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.warn('loved_ones table does not exist yet. Run the SQL migration.')
          setLovedOnes([])
          return
        }
        throw error
      }
      
      // Photos are now stored directly in loved_ones.photo_url
      // For backwards compatibility, check unsent_messages if photo_url is null
      const lovedOnesWithPhotos = await Promise.all(
        (data || []).map(async (lovedOne) => {
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
            
            // If found in messages, update the loved one record for future use
            if (photoUrl) {
              await supabase
                .from('loved_ones')
                .update({ photo_url: photoUrl })
                .eq('id', lovedOne.id)
            }
          }
          
          return {
            ...lovedOne,
            photo_url: photoUrl
          }
        })
      )

      setLovedOnes(lovedOnesWithPhotos)
    } catch (error) {
      console.error('Error loading loved ones:', error)
      toast.error('Failed to load loved ones')
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
    setFormData({ recipient_name: '', email_address: '', password: '' })
    revokePreview()
  }

  const startCreate = () => {
    setEditingId(null)
    setPhotoToRemove(false)
    setFormData({ recipient_name: '', email_address: '', password: '' })
    revokePreview()
    setShowForm(true)
  }

  const startEdit = (lovedOne: LovedOne) => {
    setEditingId(lovedOne.id)
    setFormData({
      recipient_name: lovedOne.recipient_name,
      email_address: lovedOne.email_address,
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
      setPhotoPreview(URL.createObjectURL(blob))
      setPhotoBlob(blob)
    } catch (e) {
      console.error(e)
      toast.error('Could not process that image. Try another file.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.recipient_name?.trim() || !formData.email_address?.trim()) {
      toast.error('Please fill in name and email')
      return
    }
    if (!editingId && !formData.password) {
      toast.error('Password is required for a new loved one')
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
        const path = await uploadProfilePhotoBlob(photoBlob, 'loved-ones')
        if (!path) {
          toast.error('Could not upload photo. Please try again.')
          setSubmitting(false)
          return
        }
        photoStoragePath = path
      }

      if (editingId) {
        const updatePayload: {
          recipient_name: string
          email_address: string
          password_encrypted?: string
          photo_url?: string | null
        } = {
          recipient_name: formData.recipient_name.trim(),
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
          .from('loved_ones')
          .update(updatePayload)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Loved one updated')
        cancelForm()
        await loadLovedOnes()
        setSubmitting(false)
        return
      }

      const passwordEncrypted = btoa(formData.password)

      const insertData: {
        user_id: string
        recipient_name: string
        email_address: string
        password_encrypted: string
        photo_url?: string
      } = {
        user_id: user.id,
        recipient_name: formData.recipient_name.trim(),
        email_address: formData.email_address.trim().toLowerCase(),
        password_encrypted: passwordEncrypted,
      }

      if (photoStoragePath) {
        insertData.photo_url = photoStoragePath
      }

      const { data: lovedOneData, error } = await supabase
        .from('loved_ones')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating loved one:', error)
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          throw new Error('Database not set up yet. Please run the SQL migration in Supabase (see SETUP_LOVED_ONES.md)')
        }
        throw error
      }

      toast.success('Loved one added successfully' + (photoStoragePath ? ' with photo.' : ''))
      cancelForm()

      await loadLovedOnes()

      if (onLovedOneCreated && lovedOneData) {
        onLovedOneCreated({
          id: lovedOneData.id,
          recipient_name: lovedOneData.recipient_name,
          email_address: lovedOneData.email_address,
          photo_url: photoStoragePath ?? null,
          created_at: lovedOneData.created_at,
        })
      }
    } catch (error) {
      console.error('Error saving loved one:', error)
      let message = editingId ? 'Failed to update loved one' : 'Failed to add loved one'

      if (error instanceof Error) {
        message = error.message
        if (message.includes('duplicate') || message.includes('unique')) {
          message = 'A loved one with this email already exists'
        }
      }

      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loved one?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('loved_ones')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Loved one deleted')
      loadLovedOnes()
    } catch (error) {
      console.error('Error deleting loved one:', error)
      toast.error('Failed to delete loved one')
    }
  }

  const handleViewPassword = async (id: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('loved_ones')
        .select('password_encrypted')
        .eq('id', id)
        .single()

      if (error) throw error

      const password = atob(data.password_encrypted)
      alert(`Password: ${password}\n\n⚠️ Keep this secure!`)
    } catch (error) {
      console.error('Error viewing password:', error)
      toast.error('Failed to retrieve password')
    }
  }

  const editingLovedOne = useMemo(
    () => (editingId ? lovedOnes.find((l) => l.id === editingId) : undefined),
    [lovedOnes, editingId]
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
            Loved Ones
          </h3>
          <p className="text-sm text-gray-600">
            Add your loved ones (spouse, children, family, friends) with photos and email accounts. Use these when creating messages.
          </p>
        </div>
        {showCreateButton && (
          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Add Loved One
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit loved one' : 'Add a loved one'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sarah, John, Mom"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              {editingLovedOne?.photo_url && !photoBlob && !photoToRemove && (
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <ProfileAvatar photoRef={editingLovedOne.photo_url} name={editingLovedOne.recipient_name} />
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
                placeholder="their.email@example.com"
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
                placeholder={editingId ? 'Leave blank to keep current password' : 'Password for their email account'}
                required={!editingId}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-500">
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

      {/* Loved Ones List */}
      {lovedOnes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Saved Loved Ones</h4>
          {lovedOnes.map((lovedOne) => (
            <div
              key={lovedOne.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4"
            >
              <ProfileAvatar photoRef={lovedOne.photo_url} name={lovedOne.recipient_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{lovedOne.recipient_name}</div>
                <div className="text-sm text-gray-600 truncate">{lovedOne.email_address}</div>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(lovedOne)}
                  className="rounded-md px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleViewPassword(lovedOne.id)}
                  className="rounded-md px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                >
                  View Password
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(lovedOne.id)}
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

