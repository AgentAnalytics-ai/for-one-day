'use client'

import { useState } from 'react'
// Emergency actions removed - implementing inline

export function EmergencyAccessForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Simple inline implementation for emergency access request
      const response = await fetch('/api/emergency-access', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Your request has been submitted successfully. We will contact you within 1-2 business days to verify your identity and process your request.' 
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit request' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Request Information
      </h3>

      {/* Account Holder Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">Account Holder Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="account_holder_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="account_holder_name"
              name="account_holder_name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the account holder's full name"
            />
          </div>

          <div>
            <label htmlFor="account_holder_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="account_holder_email"
              name="account_holder_email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the account holder's email"
            />
          </div>
        </div>
      </div>

      {/* Requester Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">Your Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="requester_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              id="requester_name"
              name="requester_name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="requester_relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to Account Holder *
            </label>
            <select
              id="requester_relationship"
              name="requester_relationship"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="requester_email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email Address *
            </label>
            <input
              type="email"
              id="requester_email"
              name="requester_email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="requester_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Your Phone Number
            </label>
            <input
              type="tel"
              id="requester_phone"
              name="requester_phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">Request Details</h4>
        
        <div>
          <label htmlFor="request_reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Request *
          </label>
          <select
            id="request_reason"
            name="request_reason"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select reason</option>
            <option value="death">Account holder has passed away</option>
            <option value="incapacitated">Account holder is incapacitated</option>
            <option value="missing">Account holder is missing</option>
            <option value="other">Other reason</option>
          </select>
        </div>

        <div>
          <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information
          </label>
          <textarea
            id="additional_info"
            name="additional_info"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide any additional information that might help us verify your identity and process your request..."
          />
        </div>
      </div>

      {/* Verification Checkbox */}
      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            name="verification_agreement"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-700">
            I understand that I will need to provide verification of my identity and relationship 
            to the account holder. I also understand that providing false information may result 
            in legal consequences. *
          </span>
        </label>
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}
