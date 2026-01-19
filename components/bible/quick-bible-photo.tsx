'use client'

import { useState, useRef } from 'react'
import { Camera, Mic, Loader2, Check } from 'lucide-react'
import { toast } from '@/lib/toast'

interface QuickBiblePhotoProps {
  dayNumber: number
  book: string
  chapter: number
}

/**
 * 📷 Quick Bible Photo Upload
 * Photo-first, minimal friction - camera button → upload → done
 */
export function QuickBiblePhoto({ dayNumber, book, chapter }: QuickBiblePhotoProps) {
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [quickNote, setQuickNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
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

      setSaved(true)
      toast.success('Saved!')
      
      // Reset after 2 seconds and refresh page
      setTimeout(() => {
        setSaved(false)
        setQuickNote('')
        setShowNoteInput(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Refresh page to show updated state
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Error saving Bible photo:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setUploading(false)
    }
  }

  const handleVoiceNote = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // For now, just show note input
        // In future, could transcribe audio here
        setShowNoteInput(true)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Microphone access denied')
      setShowNoteInput(true) // Fallback to text input
    }
  }

  return (
    <div className="space-y-4">
      {/* Big Camera Button - Mobile Optimized */}
      <button
        onClick={handleCameraClick}
        disabled={uploading || saved}
        className={`w-full min-h-[140px] py-8 px-6 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
          saved
            ? 'bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-400 text-secondary-700 shadow-secondary-200/50'
            : uploading
            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-500 text-primary-700 hover:bg-gradient-to-br hover:from-primary-100 hover:to-primary-200 hover:border-primary-600 hover:shadow-xl active:scale-[0.98] focus:ring-4 focus:ring-primary-300 focus:outline-none'
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
        
        <div className="flex flex-col items-center gap-4">
          {saved ? (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary-200 flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                <Check className="w-10 h-10 text-secondary-700" />
              </div>
              <span className="font-bold text-xl text-secondary-900">Saved!</span>
              <span className="text-sm text-secondary-700 font-medium">Your photo has been uploaded</span>
            </>
          ) : uploading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center shadow-md">
                <Loader2 className="w-10 h-10 text-primary-700 animate-spin" />
              </div>
              <span className="font-bold text-xl text-primary-900">Uploading...</span>
              <span className="text-sm text-primary-700 font-medium">Please wait</span>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xl text-primary-900 block">Take Photo</span>
                <span className="text-sm text-primary-700 font-medium">Tap to capture your Bible page</span>
              </div>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:ring-4 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200 shadow-sm"
                rows={3}
                maxLength={200}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNoteInput(false)
                    setQuickNote('')
                  }}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleVoiceNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 focus:ring-4 focus:ring-primary-300 focus:outline-none"
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
              <span>{isRecording ? 'Recording... Tap to stop' : 'Add Quick Note (Optional)'}</span>
            </button>
          )}
        </div>
      )}

      {/* Today's Assignment Info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Today's Reading</span>
          <span className="text-sm font-bold text-primary-900">Day {dayNumber}: {book} {chapter}</span>
        </div>
      </div>
    </div>
  )
}
