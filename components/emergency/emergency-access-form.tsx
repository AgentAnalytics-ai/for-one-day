'use client'

import { useState } from 'react'
import { createEmergencyAccess } from '@/app/actions/emergency-actions'

/**
 * 🚨 Emergency Access Request Form
 * Professional crisis access with proper validation and audit trails
 */

interface EmergencyAccessFormProps {
  familyId: string
}

export function EmergencyAccessForm({ familyId }: EmergencyAccessFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    emergency_type: '',
    access_reason: '',
    duration_hours: '24',
    verification_method: ''
  })

  const emergencyTypes = [
    { value: 'medical', label: 'Medical Emergency', description: 'Medical crisis requiring immediate access to health information' },
    { value: 'legal', label: 'Legal Emergency', description: 'Legal matter requiring access to estate documents' },
    { value: 'death', label: 'Death', description: 'Family member death requiring full estate access' },
    { value: 'incapacitation', label: 'Incapacitation', description: 'Family member unable to provide access themselves' },
    { value: 'other', label: 'Other Crisis', description: 'Other emergency situation requiring family access' }
  ]

  const durationOptions = [
    { value: '6', label: '6 hours', description: 'Short-term emergency access' },
    { value: '24', label: '24 hours', description: 'Standard emergency access' },
    { value: '72', label: '72 hours', description: 'Extended emergency access' },
    { value: '168', label: '1 week', description: 'Long-term crisis management' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append('family_id', familyId)
      submitFormData.append('emergency_type', formData.emergency_type)
      submitFormData.append('access_reason', formData.access_reason)
      submitFormData.append('duration_hours', formData.duration_hours)
      submitFormData.append('verification_method', formData.verification_method)

      await createEmergencyAccess(submitFormData)
    } catch (error) {
      console.error('Error creating emergency access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.emergency_type && formData.access_reason.trim().length >= 10

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Emergency Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Emergency Type *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {emergencyTypes.map(type => (
            <label
              key={type.value}
              className={`relative flex items-start p-4 border rounded-lg cursor-pointer hover:border-red-300 transition-colors ${
                formData.emergency_type === type.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="emergency_type"
                value={type.value}
                checked={formData.emergency_type === type.value}
                onChange={(e) => handleInputChange('emergency_type', e.target.value)}
                className="sr-only"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.emergency_type === type.value
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.emergency_type === type.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </div>
              
              {type.value === 'death' && (
                <div className="ml-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Full Access
                  </span>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Access Reason */}
      <div>
        <label htmlFor="access_reason" className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Reason for Emergency Access *
        </label>
        <textarea
          id="access_reason"
          rows={4}
          value={formData.access_reason}
          onChange={(e) => handleInputChange('access_reason', e.target.value)}
          placeholder="Please provide a detailed explanation of the emergency situation and why immediate access is required..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          required
          minLength={10}
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum 10 characters. This will be logged for audit purposes.
        </p>
      </div>

      {/* Access Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Access Duration
        </label>
        <div className="grid grid-cols-2 gap-3">
          {durationOptions.map(option => (
            <label
              key={option.value}
              className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:border-red-300 transition-colors ${
                formData.duration_hours === option.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="duration_hours"
                value={option.value}
                checked={formData.duration_hours === option.value}
                onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                className="sr-only"
              />
              
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${
                formData.duration_hours === option.value
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300'
              }`}>
                {formData.duration_hours === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Verification Method */}
      <div>
        <label htmlFor="verification_method" className="block text-sm font-medium text-gray-700 mb-2">
          How can your identity be verified? (Optional)
        </label>
        <input
          type="text"
          id="verification_method"
          value={formData.verification_method}
          onChange={(e) => handleInputChange('verification_method', e.target.value)}
          placeholder="e.g., Phone call to [number], Email verification, In-person meeting..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Providing verification method helps family members confirm your identity.
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Emergency Access Notice</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• This request will be logged and audited for security purposes</li>
              <li>• Family members will be notified of this emergency access request</li>
              <li>• Access will automatically expire after the specified duration</li>
              <li>• Only use emergency access during genuine crisis situations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Requesting Access...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Request Emergency Access
            </>
          )}
        </button>
      </div>
    </form>
  )
}
