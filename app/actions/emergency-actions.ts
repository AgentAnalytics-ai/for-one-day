'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CreateEmergencyAccessSchema } from '@/lib/schemas/family'

/**
 * 🚨 Emergency Access Actions
 * Professional crisis management with audit trails
 */

export async function createEmergencyAccess(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    emergency_type: formData.get('emergency_type') as string,
    access_reason: formData.get('access_reason') as string,
    verification_method: formData.get('verification_method') as string || undefined
  }

  const validation = CreateEmergencyAccessSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/emergency/access?error=' + encodeURIComponent(errors))
  }

  const { emergency_type, access_reason, verification_method } = validation.data
  const durationHours = parseInt(formData.get('duration_hours') as string) || 24

  try {
    // Get user's family context
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      redirect('/emergency/access?error=' + encodeURIComponent('Family membership required'))
    }

    // Verify emergency access authorization
    if (!familyMember.emergency_access && familyMember.role !== 'trust_executor') {
      redirect('/emergency/access?error=' + encodeURIComponent('Emergency access not authorized'))
    }

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    // Create emergency access log
    const { error } = await supabase
      .from('emergency_access_logs')
      .insert({
        family_id: familyMember.family_id,
        accessed_by: user.id,
        access_reason: access_reason,
        emergency_type: emergency_type as any,
        verification_method: verification_method,
        expires_at: expiresAt.toISOString(),
        items_accessed: {},
        actions_taken: {}
      })

    if (error) {
      console.error('Error creating emergency access:', error)
      redirect('/emergency/access?error=' + encodeURIComponent('Failed to create emergency access'))
    }

    // TODO: Send notifications to family members
    // TODO: Send email/SMS alerts about emergency access

    revalidatePath('/emergency/access')
    redirect('/emergency/access?success=' + encodeURIComponent('Emergency access granted. Access expires in ' + durationHours + ' hours.'))
    
  } catch (error) {
    console.error('Error in createEmergencyAccess:', error)
    redirect('/emergency/access?error=' + encodeURIComponent('An error occurred while processing emergency access'))
  }
}

export async function resolveEmergencyAccess(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const logId = formData.get('log_id') as string
  const resolutionNotes = formData.get('resolution_notes') as string

  try {
    // Get user's family context
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      redirect('/emergency/access?error=' + encodeURIComponent('Family membership required'))
    }

    // Update emergency access log
    const { error } = await supabase
      .from('emergency_access_logs')
      .update({
        resolved_at: new Date().toISOString(),
        verified_by: user.id,
        actions_taken: {
          resolution_notes: resolutionNotes,
          resolved_by_role: familyMember.role
        }
      })
      .eq('id', logId)
      .eq('family_id', familyMember.family_id) // Security: only family members can resolve

    if (error) {
      console.error('Error resolving emergency access:', error)
      redirect('/emergency/access?error=' + encodeURIComponent('Failed to resolve emergency access'))
    }

    revalidatePath('/emergency/access')
    redirect('/emergency/access?success=' + encodeURIComponent('Emergency access resolved successfully'))
    
  } catch (error) {
    console.error('Error in resolveEmergencyAccess:', error)
    redirect('/emergency/access?error=' + encodeURIComponent('An error occurred while resolving emergency access'))
  }
}

export async function logEmergencyAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const logId = formData.get('log_id') as string
  const action = formData.get('action') as string
  const itemId = formData.get('item_id') as string

  try {
    // Get current emergency access log
    const { data: emergencyLog } = await supabase
      .from('emergency_access_logs')
      .select('*')
      .eq('id', logId)
      .eq('accessed_by', user.id)
      .single()

    if (!emergencyLog || emergencyLog.resolved_at || new Date(emergencyLog.expires_at) <= new Date()) {
      return { error: 'Emergency access not active' }
    }

    // Update actions taken
    const currentActions = emergencyLog.actions_taken || {}
    const updatedActions = {
      ...currentActions,
      [`${Date.now()}`]: {
        action,
        item_id: itemId,
        timestamp: new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('emergency_access_logs')
      .update({
        actions_taken: updatedActions
      })
      .eq('id', logId)

    if (error) {
      console.error('Error logging emergency action:', error)
      return { error: 'Failed to log action' }
    }

    return { success: true }
    
  } catch (error) {
    console.error('Error in logEmergencyAction:', error)
    return { error: 'An error occurred' }
  }
}
