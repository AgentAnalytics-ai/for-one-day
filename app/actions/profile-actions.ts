'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const updates: Record<string, string | boolean | null> = {
      full_name: formData.get('full_name') as string,
      emergency_contact_name: formData.get('emergency_contact_name') as string,
      emergency_contact_email: formData.get('emergency_contact_email') as string,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string,
      emergency_contact_relationship: formData.get('emergency_contact_relationship') as string,
      emergency_access_notes: formData.get('emergency_access_notes') as string,
      emergency_access_enabled: formData.get('emergency_access_enabled') === 'on',
      executor_name: formData.get('executor_name') as string,
      executor_email: formData.get('executor_email') as string,
      executor_phone: formData.get('executor_phone') as string,
      executor_relationship: formData.get('executor_relationship') as string,
      updated_at: new Date().toISOString(),
    }

    // Remove empty strings and convert to null
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') {
        updates[key] = null
      }
    })

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Failed to update profile' }
    }

    // Send notifications to spouse/executor if they were added
    try {
      const userFullName = updates.full_name || 'A family member'
      
      // Send spouse notification if emergency contact was added
      if (updates.emergency_contact_email && updates.emergency_contact_name) {
        await fetch('/api/notifications/spouse-executor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'spouse',
            contactEmail: updates.emergency_contact_email,
            contactName: updates.emergency_contact_name,
            relationship: updates.emergency_contact_relationship,
            userFullName
          })
        })
      }

      // Send executor notification if executor was added
      if (updates.executor_email && updates.executor_name) {
        await fetch('/api/notifications/spouse-executor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'executor',
            contactEmail: updates.executor_email,
            contactName: updates.executor_name,
            relationship: updates.executor_relationship,
            userFullName
          })
        })
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      // Don't fail the profile update if notifications fail
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
