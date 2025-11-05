'use client'

import { useState } from 'react'

interface AccountManagementProps {
  profile: {
    user_id: string
  } | null
}

/**
 * 🛡️ Account Management Component
 * Client-side component for interactive account actions
 */
export function AccountManagement({ profile }: AccountManagementProps) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)

  const handleUnsubscribe = () => {
    if (confirm('Are you sure you want to unsubscribe from all emails? You can re-enable them anytime in settings.')) {
      setIsUnsubscribing(true)
      window.location.href = '/unsubscribe?email=' + encodeURIComponent(profile?.user_id || '')
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your legacy notes, reflections, and data.')) {
      setIsDeleting(true)
      window.location.href = '/delete-account'
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Preferences</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage your email notifications and subscription preferences.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive weekly reflections and important updates</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="email_notifications"
              defaultChecked={true}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enabled</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvancedActions(!showAdvancedActions)}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900">Advanced Actions</h3>
            <p className="text-sm text-gray-500">Unsubscribe or close your account</p>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${showAdvancedActions ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAdvancedActions && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Preferences</p>
                <p className="text-sm text-gray-600">Manage your email subscription</p>
              </div>
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnsubscribing ? 'Processing...' : 'Unsubscribe'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Close Account</p>
                <p className="text-sm text-gray-600">Permanently remove all your data</p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Processing...' : 'Close Account'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 italic mt-2">
              These actions are permanent and cannot be undone.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
