'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { WritingModal, RecordingModal, ReminderModal } from '@/components/ui/modal'
import { useNotification, successMessages } from '@/components/ui/notification'
import { ErrorSuccessDisplay } from '@/components/ui/error-success-display'
import { saveReflection, saveVoiceNote, setReminder } from '@/app/actions/enterprise-user-actions'

/**
 * 📖 Interactive Devotional Page - Working Buttons & Feedback
 * Professional user experience with functional interactions
 */
export default function InteractiveDevotionalPage() {
  const [writingModalOpen, setWritingModalOpen] = useState(false)
  const [recordingModalOpen, setRecordingModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reflectionContent, setReflectionContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { showNotification, NotificationContainer } = useNotification()

  const today = format(new Date(), 'EEEE, MMMM d')
  const dayOfWeek = new Date().getDay()

  const handleSaveReflection = async (content: string) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('bookId', 'genesis')
      formData.append('chapterNumber', '1')

      const result = await saveReflection(formData)
      
      if (result.success) {
        setReflectionContent(content)
        showNotification(successMessages.reflectionSaved)
      } else {
        showNotification(result.error || 'Failed to save reflection', 'error')
      }
    } catch {
      showNotification('An error occurred while saving', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordVoiceNote = async (audioBlob: Blob) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', 'Daily Voice Note')
      formData.append('audioBlob', audioBlob)

      const result = await saveVoiceNote(formData)
      
      if (result.success) {
        showNotification(successMessages.voiceNoteRecorded)
      } else {
        showNotification(result.error || 'Failed to save voice note', 'error')
      }
    } catch {
      showNotification('An error occurred while recording', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetReminder = async (time: string) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('time', time)
      formData.append('type', 'family_connection')
      formData.append('content', 'Time for family connection and sharing')

      const result = await setReminder(formData)
      
      if (result.success) {
        showNotification(successMessages.reminderSet)
      } else {
        showNotification(result.error || 'Failed to set reminder', 'error')
      }
    } catch {
      showNotification('An error occurred while setting reminder', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Error/Success Display */}
        <ErrorSuccessDisplay />
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
            Sacred Rhythm
          </h1>
          <p className="text-xl text-gray-600">{today}</p>
        </div>

        {/* Current Week Progress */}
        <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">This Week&apos;s Journey</h2>
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="flex-1 text-center">
                <div className="text-xs text-gray-600 mb-2">{day}</div>
                <div className={`h-12 rounded-lg flex items-center justify-center ${
                  index < dayOfWeek - 1 
                    ? 'bg-green-100 text-green-700' 
                    : index === dayOfWeek - 1 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < dayOfWeek - 1 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : index === dayOfWeek - 1 ? (
                    <span className="text-sm font-medium">Today</span>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Devotion */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              Week 1: A Week of Gratitude
            </h2>
            
            <p className="text-lg text-gray-600 italic">
              &ldquo;Give thanks in all circumstances; for this is God&apos;s will for you in Christ Jesus.&rdquo;
            </p>
            
            <p className="text-sm text-gray-500 mt-2">1 Thessalonians 5:18</p>
          </div>

          {/* Today's Reflection */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-serif font-medium text-gray-900 mb-4 text-center">
                Today&apos;s Reflection
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-lg text-gray-800 text-center font-medium">
                  What unexpected blessing did you notice today?
                </p>
              </div>

              {/* Reflection Input */}
              <div className="space-y-4">
                <textarea
                  value={reflectionContent}
                  onChange={(e) => setReflectionContent(e.target.value)}
                  placeholder="Share your thoughts about today's blessing..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleSaveReflection(reflectionContent)}
                    disabled={!reflectionContent.trim() || isLoading}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    {isLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Save Reflection
                  </button>
                  
                  <button
                    onClick={() => setRecordingModalOpen(true)}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    Record Voice Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Connection */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Tonight&apos;s Family Connection
              </h3>
              <p className="text-gray-600">Share this question with your family tonight</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 mb-6">
            <p className="text-lg text-gray-800 font-medium text-center">
              &ldquo;What unexpected blessing did you notice today?&rdquo;
            </p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setReminderModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              Set Reminder for Tonight
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <Link
            href="/one-day"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            Add to Legacy Vault
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <WritingModal
        isOpen={writingModalOpen}
        onClose={() => setWritingModalOpen(false)}
        title="Write Your Reflection"
        prompt="What unexpected blessing did you notice today?"
        placeholder="Share your thoughts about today's blessing..."
        onSave={handleSaveReflection}
      />

      <RecordingModal
        isOpen={recordingModalOpen}
        onClose={() => setRecordingModalOpen(false)}
        title="Record Voice Note"
        prompt="Record a voice note about today's blessing or reflection"
        onSave={handleRecordVoiceNote}
      />

      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        title="Set Family Reminder"
        onSetReminder={handleSetReminder}
      />

      {/* Notifications */}
      <NotificationContainer />
    </>
  )
}
