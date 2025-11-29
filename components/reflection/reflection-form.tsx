'use client'

import { useState, useRef } from 'react'
import { PremiumButton } from '@/components/ui/premium-button'
import { toast } from '@/lib/toast'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ReflectionImage {
  url: string
  storage_path: string
  uploading?: boolean
  isExisting?: boolean // Track if this is an existing saved image
}

interface ReflectionFormProps {
  initialReflection?: string
  initialImages?: Array<{ url: string; storage_path: string }>
}

export function ReflectionForm({ 
  initialReflection = '', 
  initialImages = []
}: ReflectionFormProps = {}) {
  const [reflection, setReflection] = useState(initialReflection)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<ReflectionImage[]>(() => 
    initialImages.map(img => ({ ...img, isExisting: true }))
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]) // Track images to delete
  const [uploadingImages, setUploadingImages] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Create temp images for all files first
    const tempImages: Array<{ file: File; tempId: string; tempUrl: string }> = []
    
    validFiles.forEach((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const tempUrl = URL.createObjectURL(file)
      tempImages.push({ file, tempId, tempUrl })
      
      setImages(prev => [...prev, {
        url: tempUrl,
        storage_path: tempId,
        uploading: true
      }])
    })

    setUploadingImages(true)

    // Upload all files in parallel
    const uploadPromises = tempImages.map(async ({ file, tempId, tempUrl }) => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('date', new Date().toISOString().split('T')[0])

        const response = await fetch('/api/reflection/upload-image', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image')
        }

        URL.revokeObjectURL(tempUrl)
        
        setImages(prev => prev.map(img => 
          img.storage_path === tempId
            ? { 
                storage_path: data.image.storage_path,
                url: data.image.url,
                uploading: false 
              }
            : img
        ))
        
        return { success: true, tempId }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error(error instanceof Error ? error.message : `Failed to upload ${file.name}`)
        URL.revokeObjectURL(tempUrl)
        setImages(prev => prev.filter(img => img.storage_path !== tempId))
        return { success: false, tempId }
      }
    })

    await Promise.all(uploadPromises)
    setUploadingImages(false)
    
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const removeImage = (storagePath: string) => {
    const image = images.find(img => img.storage_path === storagePath)
    
    // If it's an existing image, mark it for deletion
    if (image?.isExisting) {
      setImagesToDelete(prev => [...prev, storagePath])
    } else if (image && image.storage_path.startsWith('temp-')) {
      // Clean up temp URLs
      URL.revokeObjectURL(image.url)
    }
    
    // Remove from display
    setImages(prev => prev.filter(img => img.storage_path !== storagePath))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reflection.trim()) {
      toast.error('Please write your reflection before saving')
      return
    }

    // Check if any images are still uploading
    const stillUploading = images.some(img => img.uploading)
    if (stillUploading || uploadingImages) {
      toast.error('Please wait for all images to finish uploading')
      return
    }

    setSaving(true)

    try {
      // Delete images that were removed
      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(async (storagePath) => {
          try {
            const response = await fetch('/api/reflection/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storage_path: storagePath })
            })
            
            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Failed to delete image')
            }
          } catch (error) {
            console.error('Error deleting image:', error)
            // Don't fail the whole save if one image deletion fails
            toast.error(`Failed to delete one image: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        })
        
        await Promise.all(deletePromises)
      }

      // Get final storage paths (filter out uploading ones and temp uploads)
      const storagePaths = images
        .filter(img => !img.uploading && img.storage_path && !img.storage_path.startsWith('temp-'))
        .map(img => img.storage_path)

      console.log('Saving reflection with storage paths:', storagePaths)

      const response = await fetch('/api/reflection/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflection: reflection.trim(),
          media_urls: storagePaths
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API error:', data)
        
        // Handle specific error cases
        if (data.errorCode === 'TABLE_MISSING') {
          toast.error('Database setup incomplete. Please contact support or run migration script.')
          alert('⚠️ Database table missing!\n\nRun this SQL in Supabase:\nsupabase/create-daily-reflections-table.sql')
        } else if (data.errorCode === 'COLUMN_MISSING') {
          toast.error('Database column missing. Please run the migration script.')
          alert('⚠️ Database column missing!\n\nRun this SQL in Supabase:\nsupabase/add-reflection-media.sql')
        } else {
          throw new Error(data.error || 'Failed to save reflection')
        }
        return
      }

      if (data.success) {
        toast.success('Reflection saved successfully!')
        // Small delay to show success message, then reload
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        throw new Error(data.error || 'Failed to save reflection')
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save reflection. Please try again.'
      toast.error(errorMessage)
      
      // Show detailed error in console for debugging
      console.error('Full error details:', {
        error,
        images,
        reflection: reflection.trim().substring(0, 50) + '...'
      })
      
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-2">
          Your Reflection
        </label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts, gratitude, or insights from today..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={6}
          required
        />
      </div>

      {/* Image Upload Section - WhatsApp-style */}
      <div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          multiple
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImages}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {images.length > 0 ? 'Add More Photos' : 'Add Photo'}
          </span>
        </button>

        {/* Image Preview Grid - WhatsApp-style */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div
                key={image.storage_path || index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
              >
                {image.uploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={`Reflection image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                
                {/* Delete button - Always visible for better UX */}
                {!image.uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(image.storage_path)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <PremiumButton
          type="submit"
          disabled={saving || !reflection.trim() || uploadingImages || images.some(img => img.uploading)}
          className="px-8 py-3"
        >
          {saving ? 'Saving...' : 'Save Reflection'}
        </PremiumButton>
        {uploadingImages || images.some(img => img.uploading) ? (
          <p className="text-sm text-gray-500">Please wait for images to finish uploading...</p>
        ) : images.length > 0 ? (
          <p className="text-sm text-gray-500">{images.length} image{images.length > 1 ? 's' : ''} ready</p>
        ) : null}
      </div>
    </form>
  )
}
