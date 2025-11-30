'use client'

import { useState } from 'react'
import { ContactSupportModal } from './contact-support-modal'

/**
 * 📱 Minimal Support Button - Meta-level mobile UX
 * Small, unobtrusive, doesn't compete with content
 */
export function SupportContactButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 active:text-blue-700 px-2 sm:px-3 py-1.5 transition-colors duration-200"
        aria-label="Contact support"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="whitespace-nowrap">Need help?</span>
      </button>

      <ContactSupportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

