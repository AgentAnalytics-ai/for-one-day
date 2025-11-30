'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile-actions'

interface Profile {
  user_id: string
  full_name?: string
  emergency_contact_email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  emergency_access_enabled?: boolean
  emergency_access_notes?: string
  executor_name?: string
  executor_email?: string
  executor_phone?: string
  executor_relationship?: string
}

interface ProfileSettingsFormProps {
  profile: Profile | null
  onSave?: () => void
  onCancel?: () => void
}

export function ProfileSettingsForm({ profile, onSave, onCancel }: ProfileSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Call onSave callback to switch back to view mode
        setTimeout(() => {
          onSave?.()
        }, 500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Profile Info */}
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Emergency Contact</h2>
        <p className="text-sm text-gray-600 mb-4">
          This person will be contacted if something happens to you and your family needs access to your legacy notes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              id="emergency_contact_name"
              name="emergency_contact_name"
              defaultValue={profile?.emergency_contact_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Sarah Johnson"
            />
          </div>

          <div>
            <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              id="emergency_contact_relationship"
              name="emergency_contact_relationship"
              defaultValue={profile?.emergency_contact_relationship || 'spouse'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="emergency_contact_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="emergency_contact_email"
              name="emergency_contact_email"
              defaultValue={profile?.emergency_contact_email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sarah@example.com"
            />
          </div>

          <div>
            <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              defaultValue={profile?.emergency_contact_phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="emergency_access_notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="emergency_access_notes"
            name="emergency_access_notes"
            rows={3}
            defaultValue={profile?.emergency_access_notes || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information that might help verify your emergency contact's identity..."
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="emergency_access_enabled"
              defaultChecked={profile?.emergency_access_enabled !== false}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Enable emergency access for my legacy notes
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            When enabled, your emergency contact can request access to your legacy notes through our support team.
          </p>
        </div>
      </div>

      {/* Executor/Trustee Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Executor/Trustee</h2>
        <p className="text-sm text-gray-600 mb-4">
          Designate someone who will have legal authority to access your legacy notes and handle your affairs. 
          This is typically your spouse, adult child, or a trusted family member.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="executor_name" className="block text-sm font-medium text-gray-700 mb-1">
              Executor/Trustee Name
            </label>
            <input
              type="text"
              id="executor_name"
              name="executor_name"
              defaultValue={profile?.executor_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., John Smith"
            />
          </div>

          <div>
            <label htmlFor="executor_relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              id="executor_relationship"
              name="executor_relationship"
              defaultValue={profile?.executor_relationship || 'spouse'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="spouse">Spouse</option>
              <option value="child">Adult Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="attorney">Attorney</option>
              <option value="trustee">Trustee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="executor_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="executor_email"
              name="executor_email"
              defaultValue={profile?.executor_email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="executor_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="executor_phone"
              name="executor_phone"
              defaultValue={profile?.executor_phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Legal Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This executor/trustee designation is for accessing your digital legacy notes only. 
                  For legal matters, wills, and estate planning, please consult with an attorney and 
                  ensure your legal documents are properly executed and up to date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
