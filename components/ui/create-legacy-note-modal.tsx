'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Heart, User, Users, Mic, MicOff, Play, Pause, Image as ImageIcon, Video, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UpgradeModal } from './upgrade-modal'
import Image from 'next/image'

interface LegacyTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  placeholders: string[]
}

interface Attachment {
  storage_path: string
  url?: string  // Make url optional to match vault page
  type: 'image' | 'video'
  mime_type: string
  file_size_bytes: number
  filename?: string
  uploading?: boolean
  error?: string
}

interface VaultItem {
  id: string
  title: string
  description: string
  kind: string
  metadata?: {
    content?: string
    recipient_name?: string  // Use recipient_name to match vault page
    recipient_email?: string
    template_type?: string  // Use template_type to match vault page
    is_shared?: boolean
    recipient?: string  // Keep for backward compatibility
    occasion?: string
    template_id?: string  // Keep for backward compatibility
    attachments?: Attachment[]
  }
}

interface CreateLegacyNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedTemplate?: LegacyTemplate | null
  editingItem?: VaultItem | null
}

export function CreateLegacyNoteModal({ isOpen, onClose, onSuccess, selectedTemplate, editingItem }: CreateLegacyNoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string>('')
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'lifetime'>('free')
  const [legacyNoteCount, setLegacyNoteCount] = useState(0)
  const [familyMembers, setFamilyMembers] = useState<Array<{id: string, name: string, role: string}>>([])
  const [sharingSettings, setSharingSettings] = useState<Record<string, boolean>>({})
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient: 'family',
    recipientName: '', // NEW: Actual name (e.g., "Sarah")
    occasion: ''
  })
  
  // Attachment state
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploadingAttachments, setUploadingAttachments] = useState(false)

  // Fetch user plan and legacy note count
  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          setUserPlan(profile.plan as 'free' | 'pro' | 'lifetime')
        }

        // Get legacy note count
        const { count } = await supabase
          .from('vault_items')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .eq('kind', 'letter')
        
        setLegacyNoteCount(count || 0)

        // Get family members for sharing
        const { data: members } = await supabase
          .from('family_members')
          .select(`
            user_id,
            role,
            profiles!inner(full_name)
          `)
          .neq('user_id', user.id) // Exclude current user
        
        if (members) {
          setFamilyMembers(members.map(member => ({
            id: member.user_id,
            name: (member.profiles as { full_name: string }[])[0]?.full_name || 'Unknown',
            role: member.role
          })))
        }
      }
    }
    
    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen])

  // Populate form when template is selected OR when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        content: editingItem.metadata?.content || editingItem.description,
        recipient: editingItem.metadata?.recipient || 'family',
        recipientName: editingItem.metadata?.recipient_name || '',
        occasion: editingItem.metadata?.occasion || ''
      })
      // Load existing attachments
      if (editingItem.metadata?.attachments) {
        setAttachments(editingItem.metadata.attachments as Attachment[])
      }
    } else if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplate.name,
        content: selectedTemplate.template_content
      }))
    }
  }, [selectedTemplate, editingItem])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  if (!isOpen) return null

  // Safety check to prevent ref access before component is fully mounted
  if (typeof window === 'undefined') return null

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          setAudioBlob(blob)
          setAudioUrl(URL.createObjectURL(blob))
          stream.getTracks().forEach(track => track.stop())
        } catch (error) {
          console.error('Error processing recording:', error)
        }
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
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    try {
      if (audioUrl && audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error('Error playing recording:', error)
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    try {
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error deleting recording:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle file upload
  const handleFileSelect = async (file: File, isVideo: boolean) => {
    // Check if user can add attachments
    const currentCount = attachments.filter(a => !a.uploading).length
    const canAddVideo = userPlan === 'pro' || userPlan === 'lifetime'
    
    if (isVideo && !canAddVideo) {
      setUpgradeFeature('Video Attachments')
      setShowUpgradeModal(true)
      return
    }
    
    if (userPlan === 'free' && currentCount >= 3) {
      alert('Free users can add up to 3 attachments per letter. Upgrade to Pro for unlimited attachments.')
      setUpgradeFeature('Unlimited Attachments')
      setShowUpgradeModal(true)
      return
    }

    // Create temporary attachment object for preview
    const tempId = `temp-${Date.now()}`
    const tempUrl = URL.createObjectURL(file)
    const tempAttachment: Attachment = {
      storage_path: tempId, // Use temp ID as identifier
      url: tempUrl,
      type: isVideo ? 'video' : 'image',
      mime_type: file.type,
      file_size_bytes: file.size,
      filename: file.name,
      uploading: true
    }

    setAttachments(prev => [...prev, tempAttachment])
    setUploadingAttachments(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      if (editingItem?.id) {
        uploadFormData.append('vault_item_id', editingItem.id)
      }

      const response = await fetch('/api/vault/upload-attachment', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.upgradeRequired) {
          setShowUpgradeModal(true)
          setAttachments(prev => prev.filter(a => a.storage_path !== tempId))
          URL.revokeObjectURL(tempUrl)
          return
        }
        throw new Error(data.error || 'Failed to upload file')
      }

      // Revoke temp URL and update attachment with server response
      URL.revokeObjectURL(tempUrl)
      setAttachments(prev => prev.map(a => 
        a.storage_path === tempId
          ? { ...data.attachment, uploading: false }
          : a
      ))
    } catch (error) {
      console.error('Error uploading attachment:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload file. Please try again.')
      setAttachments(prev => prev.filter(a => a.storage_path !== tempId))
      URL.revokeObjectURL(tempUrl)
    } finally {
      setUploadingAttachments(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file, false)
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file, true)
    }
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const removeAttachment = (storagePath: string) => {
    setAttachments(prev => prev.filter(a => a.storage_path !== storagePath))
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
          const errorData = await response.json()
          if (errorData.upgradeRequired) {
            // Show upgrade prompt
            if (confirm(`${errorData.error}\n\nWould you like to upgrade to Pro?`)) {
              window.location.href = '/upgrade'
            }
            return
          }
          throw new Error(errorData.error || 'Failed to upload voice recording')
        }

        const result = await response.json()
        if (result.success) {
          onSuccess()
          onClose()
          resetForm()
        } else {
          throw new Error(result.error || 'Failed to save voice note')
        }
      } else if (editingItem) {
        // Update existing note
        // Filter out uploading attachments and prepare final list
        const finalAttachments = attachments
          .filter(a => !a.uploading && a.storage_path)
          .map(({ uploading, error, ...rest }) => rest)

        const response = await fetch(`/api/vault/items/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            recipient: formData.recipient,
            recipient_name: formData.recipientName.trim() || undefined,
            occasion: formData.occasion,
            sharing_settings: sharingSettings,
            attachments: finalAttachments
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update legacy note')
        }

        const result = await response.json()
        if (result.success) {
          onSuccess()
          onClose()
          resetForm()
        } else {
          throw new Error(result.error || 'Failed to update legacy note')
        }
      } else {
        // Create new text note using API
        // Filter out uploading attachments and prepare final list
        const finalAttachments = attachments
          .filter(a => !a.uploading && a.storage_path)
          .map(({ uploading, error, ...rest }) => rest)

        const form = new FormData()
        form.append('title', formData.title)
        form.append('content', formData.content)
        form.append('recipient', formData.recipient)
        if (formData.recipientName.trim()) {
          form.append('recipient_name', formData.recipientName.trim())
        }
        form.append('occasion', formData.occasion)
        form.append('sharing_settings', JSON.stringify(sharingSettings))
        if (finalAttachments.length > 0) {
          form.append('attachments', JSON.stringify(finalAttachments))
        }

        const response = await fetch('/api/vault/save-legacy-note', {
          method: 'POST',
          body: form
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.upgradeRequired) {
            setShowUpgradeModal(true)
            return
          }
          throw new Error(errorData.error || 'Failed to save legacy note')
        }

        const result = await response.json()
        if (result.success) {
          onSuccess()
          onClose()
          resetForm()
        } else {
          throw new Error(result.error || 'Failed to save legacy note')
        }
      }
    } catch (error) {
      console.error('Error creating legacy note:', error)
      alert(error instanceof Error ? error.message : 'Failed to save legacy note. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      recipient: 'family',
      recipientName: '',
      occasion: ''
    })
    setSharingSettings({})
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsRecording(false)
    setIsPlaying(false)
    setAttachments([])
    setUploadingAttachments(false)
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Legacy Note' : 'Create Legacy Note'}
                </h2>
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

          {/* Usage Counter - Free plan only */}
          {userPlan === 'free' && (
            <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Legacy Notes Used: <span className="font-semibold text-blue-600">{legacyNoteCount} / 3</span>
                </span>
                {legacyNoteCount >= 3 && (
                  <span className="text-xs text-red-600 font-medium">Upgrade needed</span>
                )}
              </div>
            </div>
          )}

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

            {/* Recipient Name - Show only if specific person selected */}
            {formData.recipient !== 'family' && (
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Their Name (Optional)
                </label>
                <input
                  type="text"
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Sarah, Emily, John"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add their name to organize notes by person
                </p>
              </div>
            )}

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

            {/* Sharing Settings */}
            {familyMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share with Family Members
                </label>
                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={sharingSettings[member.id] || false}
                        onChange={(e) => setSharingSettings(prev => ({
                          ...prev,
                          [member.id]: e.target.checked
                        }))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only selected family members will be able to view this legacy note
                </p>
              </div>
            )}

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
                  onClick={() => {
                    if (userPlan === 'free') {
                      setUpgradeFeature('Voice Recordings')
                      setShowUpgradeModal(true)
                    } else {
                      startRecording()
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all relative ${
                    audioBlob
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : userPlan === 'free'
                      ? 'border-gray-200 hover:border-gray-300 text-gray-700 opacity-60'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium">Record Voice</span>
                  {userPlan === 'free' && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
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
                {/* Recording Controls (Pro only) */}
                {userPlan !== 'free' ? (
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
                ) : (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-sm text-purple-700 font-medium">Voice recording is a Pro feature.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUpgradeFeature('Voice Recordings')
                        setShowUpgradeModal(true)
                      }}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}

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

            {/* Attachments Section - Instagram-style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos or Videos
              </label>
              
              {/* Upload Buttons */}
              <div className="flex gap-3 mb-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingAttachments || (userPlan === 'free' && attachments.length >= 3)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Add Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (userPlan === 'free') {
                      setUpgradeFeature('Video Attachments')
                      setShowUpgradeModal(true)
                    } else {
                      videoInputRef.current?.click()
                    }
                  }}
                  disabled={uploadingAttachments}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all relative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Add Video</span>
                  {userPlan === 'free' && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </button>
              </div>

              {/* Attachment Limit Display */}
              {userPlan === 'free' && (
                <p className="text-xs text-gray-500 mb-3">
                  {attachments.filter(a => !a.uploading).length} / 3 attachments added
                </p>
              )}

              {/* Preview Gallery - Instagram-style grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.storage_path || index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                    >
                      {attachment.uploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        </div>
                      ) : attachment.type === 'image' && attachment.url ? (
                        <Image
                          src={attachment.url}
                          alt={`Attachment ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : attachment.type === 'video' && attachment.url ? (
                        <video
                          src={attachment.url}
                          className="w-full h-full object-cover"
                          controls={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500 text-sm">No preview</span>
                        </div>
                      )}
                      
                      {/* Video badge */}
                      {attachment.type === 'video' && !attachment.uploading && (
                        <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                      )}
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!attachment.uploading) {
                            removeAttachment(attachment.storage_path)
                            // Revoke object URL if it's a temp upload
                            if (attachment.storage_path.startsWith('temp-') && attachment.url) {
                              URL.revokeObjectURL(attachment.url)
                            }
                          }
                        }}
                        disabled={attachment.uploading}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || uploadingAttachments}
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
                    {editingItem ? 'Update Legacy Note' : 'Create Legacy Note'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          setUpgradeFeature('')
        }}
        feature={upgradeFeature || (userPlan === 'free' && attachments.length >= 3 ? "Unlimited Attachments" : attachments.some(a => a.type === 'video') ? "Video Attachments" : "Voice Recordings")}
      />
    </div>
  )
}
