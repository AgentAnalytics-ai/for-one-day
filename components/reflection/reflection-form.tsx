'use client'

import { useState, useRef } from 'react'
import { PremiumButton } from '@/components/ui/premium-button'
import { EnhancedTextarea } from '@/components/ui/enhanced-input'
import { SuccessCelebration } from '@/components/ui/success-celebration'
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
  turnThePagePhoto?: { url: string; storage_path: string } | null
  readingContext?: string
}

export function ReflectionForm({ 
  initialReflection = '', 
  initialImages = [],
  turnThePagePhoto = null,
  readingContext = ''
}: ReflectionFormProps = {}) {
  const [reflection, setReflection] = useState(initialReflection)
  const [saving, setSaving] = useState(false)
  
  // Combine Turn the Page photo with other images (avoid duplicates)
  const allInitialImages = turnThePagePhoto && !initialImages.some(img => img.storage_path === turnThePagePhoto.storage_path)
    ? [turnThePagePhoto, ...initialImages]
    : initialImages
  
  const [images, setImages] = useState<ReflectionImage[]>(() => 
    allInitialImages.map(img => ({ ...img, isExisting: true }))
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]) // Track images to delete
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
        setShowSuccess(true)
        toast.success('Reflection saved successfully!')
        // Small delay to show success message, then reload
        setTimeout(() => {
          setShowSuccess(false)
          window.location.reload()
        }, 2000)
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
    <>
      {showSuccess && (
        <SuccessCelebration
          message="Reflection saved successfully!"
          onComplete={() => setShowSuccess(false)}
        />
      )}
      
      {/* Turn the Page Connection Banner */}
      {turnThePagePhoto && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 font-bold text-sm">1</span>
            </div>
            <p className="text-sm font-semibold text-primary-900">
              Your Turn the Page photo is included below
            </p>
          </div>
          {readingContext && (
            <p className="text-xs text-primary-700 italic ml-11">
              {readingContext}Reflect on what you read and how it connects to today&apos;s verse.
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <EnhancedTextarea
          label="Your Reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder={
            readingContext 
              ? `${readingContext}How does this connect to today's verse?`
              : "Share your thoughts, gratitude, or insights from today..."
          }
          rows={8}
          required
        />

      {/* Image Upload Section - WhatsApp-style */}
      <div>
        {/* Show Turn the Page photo prominently if it exists */}
        {turnThePagePhoto && images.some(img => img.storage_path === turnThePagePhoto.storage_path) && (
          <div className="mb-4 p-3 bg-primary-50 rounded-lg border-2 border-primary-300">
            <p className="text-xs font-semibold text-primary-700 mb-2 flex items-center gap-1">
              <span>From Turn the Page Challenge</span>
            </p>
            <div className="relative aspect-square w-32 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={turnThePagePhoto.url}
                alt="Your Bible reading photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}
        
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          multiple
          className="hidden"
        />
        
        <div className="space-y-2">
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
          
          {/* Photo Suggestion - Meta-level UX guidance */}
          {images.length === 0 && !turnThePagePhoto && (
            <p className="text-xs text-gray-500 italic pl-1">
              Tip: Not sure what to capture? Try taking a photo of today&apos;s verse with your thoughts written around it, or snap something that represents your reflection.
            </p>
          )}
        </div>

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
    </>
  )
}
