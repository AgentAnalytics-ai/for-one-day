'use client'

import React, { useState, useRef } from 'react'
import { X, Heart, User, Users, Mic, MicOff, Play, Pause } from 'lucide-react'
import { saveLegacyNote } from '@/app/actions/user-actions'

interface CreateLegacyNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateLegacyNoteModal({ isOpen, onClose, onSuccess }: CreateLegacyNoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient: 'family',
    occasion: ''
  })

  if (!isOpen) return null

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (audioBlob) {
        // Upload voice recording
        const form = new FormData()
        form.append('audio', audioBlob, 'voice-note.webm')
        form.append('title', formData.title)
        form.append('content', formData.content)

        const response = await fetch('/api/voice-upload', {
          method: 'POST',
          body: form
        })

        if (!response.ok) {
          throw new Error('Failed to upload voice recording')
        }

        const result = await response.json()
        if (result.success) {
          onSuccess()
          onClose()
          resetForm()
        } else {
          throw new Error(result.error || 'Failed to save voice note')
        }
      } else {
        // Save as text note
        const form = new FormData()
        form.append('title', formData.title)
        form.append('content', formData.content)
        form.append('recipient', formData.recipient)
        form.append('occasion', formData.occasion)

        await saveLegacyNote(form)
        onSuccess()
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error('Error creating legacy note:', error)
      alert('Failed to save legacy note. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      recipient: 'family',
      occasion: ''
    })
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsRecording(false)
    setIsPlaying(false)
  }

  const recipientOptions = [
    { value: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
    { value: 'wife', label: 'Wife', icon: <Heart className="w-4 h-4" /> },
    { value: 'son', label: 'Son', icon: <User className="w-4 h-4" /> },
    { value: 'daughter', label: 'Daughter', icon: <Heart className="w-4 h-4" /> },
    { value: 'children', label: 'Children', icon: <Users className="w-4 h-4" /> }
  ]

  const occasionOptions = [
    'General',
    'Wedding Day',
    'Graduation',
    'Birthday',
    'Anniversary',
    'Special Moment',
    'Life Lesson',
    'Encouragement',
    'Wisdom',
    'Love Letter'
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Legacy Note</h2>
                <p className="text-sm text-gray-500">Share your heart with your family</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., For My Daughter on Her Wedding Day"
                required
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                For
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {recipientOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recipient: option.value }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.recipient === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                Occasion (Optional)
              </label>
              <select
                id="occasion"
                value={formData.occasion}
                onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select an occasion</option>
                {occasionOptions.map((occasion) => (
                  <option key={occasion} value={occasion}>{occasion}</option>
                ))}
              </select>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you like to share your message?
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: '' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    !audioBlob
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium">Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: 'Voice recording' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    audioBlob
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium">Record Voice</span>
                </button>
              </div>
            </div>

            {/* Voice Recording Section */}
            {audioBlob ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Voice Recording</span>
                    <span className="text-xs text-purple-600">({formatTime(recordingTime)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={playRecording}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <span className="text-sm text-gray-600">Click to preview your recording</span>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                {/* Recording Controls */}
                <div className="flex items-center gap-4 mb-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Stop Recording ({formatTime(recordingTime)})</span>
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    {isRecording ? 'Recording in progress...' : 'Click to record your voice message'}
                  </span>
                </div>

                {/* Text Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Write from your heart... Share your love, wisdom, memories, or encouragement..."
                    required
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Create Legacy Note
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
