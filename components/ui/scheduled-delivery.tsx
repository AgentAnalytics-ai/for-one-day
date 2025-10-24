'use client'

import React, { useState } from 'react'
import { Calendar, Clock, Mail, User } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'

interface ScheduledDeliveryProps {
  onScheduleDelivery: (deliveryData: {
    deliveryDate: string
    deliveryTime: string
    recipients: Array<{ email: string; name: string; relationship: string }>
  }) => void
  disabled?: boolean
}

export function ScheduledDelivery({ onScheduleDelivery, disabled = false }: ScheduledDeliveryProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [recipients, setRecipients] = useState<Array<{ email: string; name: string; relationship: string }>>([
    { email: '', name: '', relationship: 'family' }
  ])

  const handleAddRecipient = () => {
    setRecipients([...recipients, { email: '', name: '', relationship: 'family' }])
  }

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index))
    }
  }

  const handleRecipientChange = (index: number, field: string, value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const handleSchedule = () => {
    const validRecipients = recipients.filter(r => r.email && r.name)
    if (validRecipients.length === 0) {
      alert('Please add at least one recipient with email and name')
      return
    }

    if (!deliveryDate || !deliveryTime) {
      alert('Please select both delivery date and time')
      return
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validRecipients.filter(r => !emailRegex.test(r.email))
    if (invalidEmails.length > 0) {
      alert(`Please enter valid email addresses for: ${invalidEmails.map(r => r.name).join(', ')}`)
      return
    }

    onScheduleDelivery({
      deliveryDate,
      deliveryTime,
      recipients: validRecipients
    })
    
    // Show success state
    setIsScheduled(true)
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10) // 10 years from now
    return maxDate.toISOString().split('T')[0]
  }

  if (!isEnabled) {
    return (
      <div className="p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Schedule Delivery</h3>
          <p className="text-blue-600 mb-4">
            Write now, deliver later. Schedule this legacy note to be sent at the perfect moment.
          </p>
          <PremiumButton
            onClick={() => setIsEnabled(true)}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Delivery
          </PremiumButton>
        </div>
      </div>
    )
  }

  if (isScheduled) {
    return (
      <div className="p-6 border-2 border-green-200 rounded-xl bg-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Delivery Scheduled!</h3>
          <p className="text-green-600 mb-4">
            Your legacy note will be delivered on {new Date(`${deliveryDate}T${deliveryTime}`).toLocaleString()}
          </p>
          <div className="text-sm text-green-600">
            Recipients: {recipients.filter(r => r.email && r.name).map(r => r.name).join(', ')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 border border-blue-200 rounded-xl bg-blue-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Schedule Delivery</h3>
            <p className="text-sm text-blue-600">Set when this legacy note should be delivered</p>
          </div>
        </div>
        <button
          onClick={() => setIsEnabled(false)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        {/* Delivery Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">
              Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">
              Delivery Time
            </label>
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-blue-700">
              Delivery Recipients
            </label>
            <button
              onClick={handleAddRecipient}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              Add Recipient
            </button>
          </div>

          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                    placeholder="e.g., Sarah Johnson"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => handleRecipientChange(index, 'email', e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-blue-700 mb-1">Relationship</label>
                    <select
                      value={recipient.relationship}
                      onChange={(e) => handleRecipientChange(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="family">Family</option>
                      <option value="wife">Wife</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="children">Children</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => handleRemoveRecipient(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Button */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <div className="text-sm text-blue-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {deliveryDate && deliveryTime && (
                <span>
                  Will be delivered on {new Date(`${deliveryDate}T${deliveryTime}`).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <PremiumButton
            onClick={handleSchedule}
            disabled={disabled || !deliveryDate || !deliveryTime}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            Schedule Delivery
          </PremiumButton>
        </div>
      </div>

      {/* Premium Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-4 pt-4 border-t border-blue-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Premium Feature: Schedule delivery for the perfect moment
      </div>
    </div>
  )
}
