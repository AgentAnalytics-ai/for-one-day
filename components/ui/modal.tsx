'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * 🎨 Professional Modal System - Billion-Dollar UI Component
 * Accessible, animated, and beautiful modal interface
 */

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * 🎨 Modal Variants for Different Use Cases
 */

export function WritingModal({ 
  isOpen, 
  onClose, 
  title, 
  prompt, 
  placeholder, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  prompt: string
  placeholder: string
  onSave: (content: string) => void
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
        {/* Prompt */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 font-medium">{prompt}</p>
        </div>
        
        {/* Writing Area */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your response
          </label>
          <textarea
            id="content"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder={placeholder}
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const content = (document.getElementById('content') as HTMLTextAreaElement)?.value
              if (content?.trim()) {
                onSave(content.trim())
                onClose()
              }
            }}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function RecordingModal({ 
  isOpen, 
  onClose, 
  title, 
  prompt, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  prompt: string
  onSave: (audioBlob: Blob) => void
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        {/* Prompt */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 font-medium">{prompt}</p>
        </div>
        
        {/* Recording Interface */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          
          <p className="text-gray-600">Click to start recording your voice note</p>
          
          <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Start Recording
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Implement actual recording functionality
              onSave(new Blob())
              onClose()
            }}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save Recording
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function ReminderModal({ 
  isOpen, 
  onClose, 
  title, 
  onSetReminder 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  onSetReminder: (time: string) => void
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Time Selection */}
        <div>
          <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-2">
            When would you like to be reminded?
          </label>
          <select
            id="reminder-time"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="6pm">6:00 PM - Dinner time</option>
            <option value="7pm">7:00 PM - After dinner</option>
            <option value="8pm">8:00 PM - Evening family time</option>
            <option value="9pm">9:00 PM - Before bedtime</option>
          </select>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const time = (document.getElementById('reminder-time') as HTMLSelectElement)?.value
              if (time) {
                onSetReminder(time)
                onClose()
              }
            }}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Set Reminder
          </button>
        </div>
      </div>
    </Modal>
  )
}
