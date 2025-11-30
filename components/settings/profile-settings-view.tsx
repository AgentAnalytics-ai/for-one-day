'use client'

import { useState } from 'react'
import { Edit2, Check, User, Mail, Phone, Users } from 'lucide-react'
import { ProfileSettingsForm } from './profile-settings-form'

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

interface ProfileSettingsViewProps {
  profile: Profile | null
  onUpdate?: () => void
}

/**
 * 👤 Profile Settings View - Meta-Level 2026 UX
 * Shows saved data in view mode, with Edit button to switch to edit mode
 * Feels like a profile page, not a form
 */
export function ProfileSettingsView({ profile, onUpdate }: ProfileSettingsViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = () => {
    setJustSaved(true)
    setIsEditing(false)
    setTimeout(() => setJustSaved(false), 3000) // Hide after 3 seconds
    onUpdate?.()
  }

  // If editing, show the form
  if (isEditing) {
    return (
      <ProfileSettingsForm 
        profile={profile} 
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  // View mode - show saved data beautifully
  const hasEmergencyContact = profile?.emergency_contact_name || profile?.emergency_contact_email
  const hasExecutor = profile?.executor_name || profile?.executor_email

  return (
    <div className="space-y-6">
      {/* Edit Button - Top Right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Success Message */}
      {justSaved && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3 transition-all duration-300">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-green-900">Settings saved successfully!</p>
            <p className="text-sm text-green-700">Your information has been updated.</p>
          </div>
        </div>
      )}

      {/* Profile Information - View Mode */}
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          Profile Information
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Full Name
              </p>
              <p className="text-base text-gray-900 font-medium">
                {profile?.full_name || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact - View Mode */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Emergency Contact
        </h2>
        
        {hasEmergencyContact ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Contact Name
                </p>
                <p className="text-base text-gray-900 font-semibold">
                  {profile?.emergency_contact_name}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Relationship
                </p>
                <p className="text-base text-gray-900 font-medium capitalize">
                  {profile?.emergency_contact_relationship || 'Not specified'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Address
                </p>
                <p className="text-base text-gray-900 font-medium">
                  {profile?.emergency_contact_email}
                </p>
              </div>
              
              {profile?.emergency_contact_phone && (
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </p>
                  <p className="text-base text-gray-900 font-medium">
                    {profile?.emergency_contact_phone}
                  </p>
                </div>
              )}
            </div>

            {profile?.emergency_access_notes && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Additional Notes
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.emergency_access_notes}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile?.emergency_access_enabled !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-gray-700">
                  Emergency access {profile?.emergency_access_enabled !== false ? 'enabled' : 'disabled'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium mb-1">No emergency contact set</p>
            <p className="text-sm text-gray-500">Click Edit to add an emergency contact</p>
          </div>
        )}
      </div>

      {/* Executor/Trustee - View Mode */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Executor/Trustee
        </h2>
        
        {hasExecutor ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Executor/Trustee Name
                </p>
                <p className="text-base text-gray-900 font-semibold">
                  {profile?.executor_name}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Relationship
                </p>
                <p className="text-base text-gray-900 font-medium capitalize">
                  {profile?.executor_relationship || 'Not specified'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Address
                </p>
                <p className="text-base text-gray-900 font-medium">
                  {profile?.executor_email}
                </p>
              </div>
              
              {profile?.executor_phone && (
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </p>
                  <p className="text-base text-gray-900 font-medium">
                    {profile?.executor_phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium mb-1">No executor/trustee set</p>
            <p className="text-sm text-gray-500">Click Edit to designate an executor/trustee</p>
          </div>
        )}
      </div>
    </div>
  )
}

