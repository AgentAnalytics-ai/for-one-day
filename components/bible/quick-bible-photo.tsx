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
      toast.success('Saved! ✅')
      
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
      {/* Big Camera Button */}
      <button
        onClick={handleCameraClick}
        disabled={uploading || saved}
        className={`w-full py-6 px-6 rounded-2xl border-2 transition-all duration-200 ${
          saved
            ? 'bg-green-50 border-green-500 text-green-700'
            : uploading
            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-white border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600 active:scale-95'
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
              <Check className="w-8 h-8" />
              <span className="font-semibold text-lg">Saved!</span>
            </>
          ) : uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="font-semibold text-lg">Uploading...</span>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8" />
              <span className="font-semibold text-lg">Take Photo</span>
              <span className="text-sm opacity-75">Tap to capture your Bible page</span>
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
              <span>{isRecording ? 'Recording...' : 'Add Quick Note (Optional)'}</span>
            </button>
          )}
        </div>
      )}

      {/* Today's Assignment Info */}
      <div className="text-center text-sm text-gray-500">
        Day {dayNumber}: {book} {chapter}
      </div>
    </div>
  )
}
