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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setFormData({ ...formData, photo: file })

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const cropAndUploadPhoto = async (file: File): Promise<string | null> => {
    try {
      // Simple crop: create square image from center
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      return new Promise((resolve) => {
        img.onload = async () => {
          // Calculate square crop from center
          const size = Math.min(img.width, img.height)
          const x = (img.width - size) / 2
          const y = (img.height - size) / 2

          // Set canvas to square (400x400 for profile photos)
          canvas.width = 400
          canvas.height = 400

          // Draw cropped and resized image
          ctx?.drawImage(img, x, y, size, size, 0, 0, 400, 400)

          // Convert to blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(null)
              return
            }

            // Upload cropped image
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
              resolve(null)
              return
            }

            const fileExt = 'jpg' // Always use jpg for cropped images
            const fileName = `children/${user.id}/${Date.now()}.${fileExt}`
            
            const { data, error } = await supabase.storage
              .from('vault')
              .upload(fileName, blob, { 
                upsert: false,
                contentType: 'image/jpeg'
              })

            if (error) {
              console.error('Upload error:', error)
              resolve(null)
              return
            }

            const { data: { publicUrl } } = supabase.storage
              .from('vault')
              .getPublicUrl(data.path)

            resolve(publicUrl)
          }, 'image/jpeg', 0.9) // 90% quality
        }

        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('Error processing photo:', error)
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

      // Upload and crop photo if provided
      let photoUrl: string | null = null
      if (formData.photo) {
        photoUrl = await cropAndUploadPhoto(formData.photo)
        if (!photoUrl) {
          toast.error('Failed to upload photo. Please try again.')
          setSubmitting(false)
          return
        }
      }

      // Create child email account with photo URL
      const passwordEncrypted = btoa(formData.password)

      const insertData: any = {
        user_id: user.id,
        child_name: formData.child_name.trim(),
        email_address: formData.email_address.trim().toLowerCase(),
        password_encrypted: passwordEncrypted
      }
      
      // Only include photo_url if we have one
      if (photoUrl) {
        insertData.photo_url = photoUrl
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

      toast.success('Child profile created successfully' + (photoUrl ? ' with photo!' : ''))
      setFormData({ child_name: '', email_address: '', password: '', photo: null })
      setPhotoPreview(null)
      setShowForm(false)
      
      // Reload children to show the new photo
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
                onChange={handlePhotoSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Photo Preview */}
              {photoPreview && (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Preview (will be cropped to square):</p>
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null)
                        setFormData({ ...formData, photo: null })
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
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
                  setPhotoPreview(null)
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

