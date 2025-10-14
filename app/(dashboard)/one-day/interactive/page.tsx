'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { WritingModal } from '@/components/ui/modal'
import { useNotification, successMessages } from '@/components/ui/notification'
import { saveLegacyNote } from '@/app/actions/user-actions'

/**
 * 🗂️ Interactive One Day Page - Working Legacy Buttons
 * Professional user experience with functional interactions
 */
export default function InteractiveOneDayPage() {
  const [writingModalOpen, setWritingModalOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<typeof legacyPrompts[0] | null>(null)
  const [, setIsLoading] = useState(false)
  
  const { showNotification, NotificationContainer } = useNotification()

  const today = format(new Date(), 'EEEE, MMMM d')

  const legacyPrompts = [
    {
      id: 'gratitude',
      title: 'Gratitude Note',
      prompt: 'Today I\'m grateful for...',
      placeholder: 'Share what you\'re grateful for today...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'wisdom',
      title: 'Life Wisdom',
      prompt: 'The most important thing I\'ve learned is...',
      placeholder: 'Share a piece of wisdom you want to pass down...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'love',
      title: 'Love Letter',
      prompt: 'What I want you to know about my love for you is...',
      placeholder: 'Write a love letter to your family...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'faith',
      title: 'Faith Story',
      prompt: 'My faith journey has taught me...',
      placeholder: 'Share your faith story and what it means to you...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'memories',
      title: 'Family Memories',
      prompt: 'My favorite memory with you is...',
      placeholder: 'Share a special memory you want to preserve...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'hopes',
      title: 'Hopes & Dreams',
      prompt: 'My greatest hope for you is...',
      placeholder: 'Share your hopes and dreams for your family...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]

  const handleSaveLegacyNote = async (content: string) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', selectedPrompt?.title || 'Legacy Note')
      formData.append('content', content)
      formData.append('type', selectedPrompt?.id || 'legacy_note')
      formData.append('recipient', 'family')

      const result = await saveLegacyNote(formData)
      
      if (result.success) {
        showNotification(successMessages.legacyNoteCreated)
        setWritingModalOpen(false)
      } else {
        showNotification(result.error || 'Failed to save legacy note', 'error')
      }
    } catch {
      showNotification('An error occurred while saving', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const openWritingModal = (prompt: typeof legacyPrompts[0]) => {
    setSelectedPrompt(prompt)
    setWritingModalOpen(true)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
            For One Day
          </h1>
          <p className="text-xl text-gray-600">{today}</p>
        </div>

        {/* Urgency Hook - Gentle, Not Morbid */}
        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 rounded-2xl p-8 border border-purple-100">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
              What if tomorrow never comes?
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Your family needs to know who you are, what you believe, and how much you love them. 
              Start with just one sentence today.
            </p>
            
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
              <p className="text-gray-800 font-medium mb-2">
                &ldquo;Today I&apos;m grateful for...&rdquo;
              </p>
              <p className="text-sm text-gray-600">Start your legacy with gratitude</p>
            </div>
          </div>
        </div>

        {/* Smart Prompts */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              Start Writing Your Legacy
            </h3>
            <p className="text-gray-600">Choose a prompt that speaks to your heart today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legacyPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => openWritingModal(prompt)}
                className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-primary-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                    {prompt.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                      {prompt.title}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-3 italic">
                      &ldquo;{prompt.prompt}&rdquo;
                    </p>
                    
                    <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
                      Start Writing
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Legacy Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-6 text-center">
            Your Legacy Timeline
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Gratitude Note</p>
                <p className="text-sm text-gray-600">Today I&apos;m grateful for my family&apos;s love and support...</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                {format(new Date(), 'MMM d')}
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your legacy grows with each note you write</p>
              <button
                onClick={() => openWritingModal(legacyPrompts[0])}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Add Your First Note
              </button>
            </div>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Your Legacy is Secure</h4>
              <p className="text-sm text-gray-600">
                All your notes are encrypted and stored securely. Only you and your family can access them.
              </p>
            </div>
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
            href="/devotional"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            Today&apos;s Devotion
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Writing Modal */}
      <WritingModal
        isOpen={writingModalOpen}
        onClose={() => setWritingModalOpen(false)}
        title={selectedPrompt?.title || 'Write Your Legacy Note'}
        prompt={selectedPrompt?.prompt || 'Share your thoughts...'}
        placeholder={selectedPrompt?.placeholder || 'Start writing...'}
        onSave={handleSaveLegacyNote}
      />

      {/* Notifications */}
      <NotificationContainer />
    </>
  )
}
