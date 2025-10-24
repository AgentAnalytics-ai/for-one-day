'use client'

import React, { useState } from 'react'
import { X, Heart } from 'lucide-react'
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { ScheduledDelivery } from '@/components/ui/scheduled-delivery'
import { toast } from '@/lib/toast'

interface LegacyTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  placeholders: string[]
}

interface TemplateLegacyNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template: LegacyTemplate
}

export function TemplateLegacyNoteModal({ isOpen, onClose, onSuccess, template }: TemplateLegacyNoteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [recipient, setRecipient] = useState('family')
  const [occasion, setOccasion] = useState('')
  const [voiceRecording, setVoiceRecording] = useState<{ blob: Blob; url: string } | null>(null)
  const [scheduledDelivery, setScheduledDelivery] = useState<{
    deliveryDate: string
    deliveryTime: string
    recipients: Array<{ email: string; name: string; relationship: string }>
  } | null>(null)

  if (!isOpen) return null

  const handleInputChange = (placeholder: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [placeholder]: value
    }))
  }

  const generateContent = () => {
    let content = template.template_content
    
    // Replace all placeholders with form data
    template.placeholders.forEach(placeholder => {
      const value = formData[placeholder] || `[${placeholder}]`
      content = content.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value)
    })
    
    return content
  }

  const handleVoiceRecordingComplete = (audioBlob: Blob, audioUrl: string) => {
    setVoiceRecording({ blob: audioBlob, url: audioUrl })
  }

  const handleRemoveVoiceRecording = () => {
    setVoiceRecording(null)
  }

  const handleScheduleDelivery = (deliveryData: {
    deliveryDate: string
    deliveryTime: string
    recipients: Array<{ email: string; name: string; relationship: string }>
  }) => {
    setScheduledDelivery(deliveryData)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const generatedContent = generateContent()
    const title = formData.RECIPIENT_NAME ? `Letter for ${formData.RECIPIENT_NAME}` : template.name

    const formDataObj = new FormData()
    formDataObj.append('title', title)
    formDataObj.append('content', generatedContent)
    formDataObj.append('recipient', recipient)
    formDataObj.append('occasion', occasion)
    formDataObj.append('template_id', template.id)

    try {
      // First, save the legacy note and get the vault item ID
      const saveResponse = await fetch('/api/vault/save-legacy-note', {
        method: 'POST',
        body: formDataObj
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save legacy note')
      }

      const { vaultItemId } = await saveResponse.json()
      
      // If we have a voice recording, upload it
      if (voiceRecording && vaultItemId) {
        const uploadFormData = new FormData()
        uploadFormData.append('audio', voiceRecording.blob, 'voice-recording.webm')
        uploadFormData.append('vaultItemId', vaultItemId)
        
        const uploadResponse = await fetch('/api/voice-upload', {
          method: 'POST',
          body: uploadFormData
        })
        
        if (!uploadResponse.ok) {
          console.error('Failed to upload voice recording')
          // Don't fail the entire operation if voice upload fails
        }
      }

      // If we have scheduled delivery, set it up
      if (scheduledDelivery && vaultItemId) {
        const scheduleResponse = await fetch('/api/schedule-delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vaultItemId,
            ...scheduledDelivery
          })
        })
        
        if (!scheduleResponse.ok) {
          const errorData = await scheduleResponse.json()
          console.error('Failed to schedule delivery:', errorData.error)
          toast.error('Scheduling Error', 'Legacy note saved but failed to schedule delivery. You can schedule it later.')
        } else {
          toast.success('Success', 'Legacy note saved and delivery scheduled successfully!')
        }
      } else {
        toast.success('Success', 'Legacy note saved successfully!')
      }
      
      // If we get here, the save was successful
      onSuccess()
      onClose()
      setFormData({})
      setRecipient('family')
      setOccasion('')
      setVoiceRecording(null)
      setScheduledDelivery(null)
    } catch (error) {
      console.error('Error saving legacy note:', error)
      toast.error('Error', error instanceof Error ? error.message : 'An unexpected error occurred while saving your note.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlaceholderLabel = (placeholder: string): string => {
    const labels: Record<string, string> = {
      'RECIPIENT_NAME': 'Recipient Name',
      'PERSONAL_MEMORY': 'Personal Memory',
      'SPECIAL_ADVICE': 'Special Advice',
      'PERSONAL_NOTE': 'Personal Note',
      'SPOUSE_NAME': 'Spouse Name',
      'FUTURE_HOPES': 'Future Hopes',
      'YOUR_NAME': 'Your Name',
      'AGE': 'Age'
    }
    return labels[placeholder] || placeholder.replace(/_/g, ' ')
  }

  const getPlaceholderPlaceholder = (placeholder: string): string => {
    const placeholders: Record<string, string> = {
      'RECIPIENT_NAME': 'e.g., Sarah, My Daughter, My Son',
      'PERSONAL_MEMORY': 'Share a special memory...',
      'SPECIAL_ADVICE': 'Share important advice...',
      'PERSONAL_NOTE': 'Add a personal note...',
      'SPOUSE_NAME': 'e.g., Emily, John',
      'FUTURE_HOPES': 'Share your hopes for their future...',
      'YOUR_NAME': 'e.g., Dad, Your Father',
      'AGE': 'e.g., 18, 21, 30'
    }
    return placeholders[placeholder] || `Enter ${placeholder.toLowerCase()}...`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Legacy Note</h2>
              <p className="text-gray-600 mt-1">Using: {template.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Template Info */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">{template.name}</h3>
                  <p className="text-sm text-purple-700">{template.description}</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-3">
                  Recipient
                </label>
                <select
                  id="recipient"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="family">Whole Family</option>
                  <option value="wife">My Wife</option>
                  <option value="son">My Son</option>
                  <option value="daughter">My Daughter</option>
                  <option value="children">My Children</option>
                </select>
              </div>
              <div>
                <label htmlFor="occasion" className="block text-sm font-semibold text-gray-700 mb-3">
                  Occasion (Optional)
                </label>
                <input
                  type="text"
                  id="occasion"
                  name="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., wedding day, graduation, 18th birthday"
                />
              </div>
            </div>

            {/* Template Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fill in the Details</h3>
              <p className="text-gray-600 text-sm">Complete the template by filling in the highlighted fields below.</p>
              
              {template.placeholders.map((placeholder) => (
                <div key={placeholder}>
                  <label htmlFor={placeholder} className="block text-sm font-semibold text-gray-700 mb-3">
                    {getPlaceholderLabel(placeholder)}
                  </label>
                  <textarea
                    id={placeholder}
                    rows={3}
                    value={formData[placeholder] || ''}
                    onChange={(e) => handleInputChange(placeholder, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                    placeholder={getPlaceholderPlaceholder(placeholder)}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Voice Recording */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Your Voice (Optional)</h3>
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecordingComplete}
                onRemoveRecording={handleRemoveVoiceRecording}
                initialAudioUrl={voiceRecording?.url}
              />
            </div>

            {/* Scheduled Delivery */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Delivery (Optional)</h3>
              <ScheduledDelivery
                onScheduleDelivery={handleScheduleDelivery}
              />
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {generateContent()}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Save Legacy Note
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
