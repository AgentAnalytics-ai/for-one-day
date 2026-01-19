'use client'

import { useState, useRef } from 'react'
import { Camera, Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { toast } from '@/lib/toast'
import { EnhancedBibleProgress } from './enhanced-bible-progress'

interface SmoothTurnThePageProps {
  dayNumber: number
  book: string
  chapter: number
  progress: {
    currentDay: number
    totalDays: number
    percentage: number
    currentBook: string
    currentChapter: number
    daysRemaining: number
  }
  completedDays: number[]
  isCompleted: boolean
}

/**
 * 📖 Smooth Turn the Page Experience
 * Photo-first, frictionless, with immediate feedback
 */
export function SmoothTurnThePage({
  dayNumber,
  book,
  chapter,
  progress,
  completedDays,
  isCompleted
}: SmoothTurnThePageProps) {
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [quickNote, setQuickNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    setSaved(false)

    try {
      // Step 1: Upload photo
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('date', new Date().toISOString().split('T')[0])

      const uploadResponse = await fetch('/api/reflection/upload-image', {
        method: 'POST',
        body: uploadFormData
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload photo')
      }

      // Step 2: Save Bible reading entry
      const saveFormData = new FormData()
      saveFormData.append('photo_path', uploadData.image.storage_path)
      if (quickNote.trim()) {
        saveFormData.append('quick_note', quickNote.trim())
        saveFormData.append('reflection', quickNote.trim())
      }

      const saveResponse = await fetch('/api/bible/quick-save', {
        method: 'POST',
        body: saveFormData
      })

      const saveData = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save Bible reading')
      }

      // Success!
      setSaved(true)
      toast.success('Saved! ✅')
      
      // Show insights after a moment
      setTimeout(() => {
        setShowInsights(true)
      }, 1500)

      // Reset after showing success
      setTimeout(() => {
        setSaved(false)
        setQuickNote('')
        setShowNoteInput(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Refresh page to show updated state
        window.location.reload()
      }, 4000)

    } catch (error) {
      console.error('Error saving Bible photo:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <EnhancedBibleProgress 
        progress={progress} 
        completedDays={completedDays}
      />

      {/* Main Action Section */}
      {!isCompleted ? (
        <div className="space-y-4">
          {/* Today's Assignment */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-3">
              <span className="text-sm font-semibold text-purple-700">
                Day {dayNumber}
              </span>
            </div>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
              {book} {chapter}
            </h3>
            <p className="text-sm text-gray-600">
              Read this chapter in your Bible, then take a photo
            </p>
          </div>

          {/* Big Camera Button */}
          <button
            onClick={handleCameraClick}
            disabled={uploading || saved}
            className={`w-full py-8 px-6 rounded-2xl border-2 transition-all duration-200 ${
              saved
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 shadow-lg'
                : uploading
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-transparent hover:from-purple-600 hover:to-indigo-700 active:scale-95 shadow-xl hover:shadow-2xl'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-3">
              {saved ? (
                <>
                  <CheckCircle2 className="w-12 h-12" />
                  <span className="font-bold text-xl">Saved! ✅</span>
                  <span className="text-sm opacity-90">Day {dayNumber} complete</span>
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <span className="font-semibold text-lg">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12" />
                  <span className="font-bold text-xl">Take Photo</span>
                  <span className="text-sm opacity-90">Tap to capture your Bible page</span>
                </>
              )}
            </div>
          </button>

          {/* Optional Quick Note */}
          {!saved && (
            <div className="space-y-2">
              {showNoteInput ? (
                <div className="space-y-2">
                  <textarea
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Add a quick note (optional)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    maxLength={200}
                  />
                  <button
                    onClick={() => {
                      setShowNoteInput(false)
                      setQuickNote('')
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span>+ Add Quick Note (Optional)</span>
                </button>
              )}
            </div>
          )}

          {/* AI Insights Preview (after save) */}
          {showInsights && saved && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-900">AI Insights Generating...</span>
              </div>
              <p className="text-sm text-amber-700">
                Your insights will appear here in a few moments
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            Day {dayNumber} Complete! 🎉
          </h3>
          <p className="text-sm text-green-700 mb-4">
            Great job! You've completed today's reading.
          </p>
          <a
            href="/reflection"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <span>Reflect Deeper</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}
