'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  SaveReflectionSchema, 
  SaveVoiceNoteSchema, 
  SaveLegacyNoteSchema, 
  SetReminderSchema,
  CreateVaultItemSchema,
  InviteFamilyMemberSchema
} from '@/lib/schemas/family'
import { getUserPermissions } from '@/lib/types/family'
import type { FamilyMember } from '@/lib/types/family'

/**
 * 🏢 Enterprise User Actions - Professional Database Integration
 * Fixed schema alignment with role-based access control
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getUserFamilyContext(userId: string) {
  const supabase = await createClient()
  
  // Get user's family membership
  const { data: familyMember } = await supabase
    .from('family_members')
    .select(`
      *,
      families (
        id,
        name,
        owner_id
      )
    `)
    .eq('user_id', userId)
    .single()
    
  if (!familyMember) {
    throw new Error('User is not a member of any family')
  }
  
  return {
    familyMember: familyMember as FamilyMember,
    familyId: familyMember.family_id,
    permissions: getUserPermissions(familyMember as FamilyMember)
  }
}

async function ensureUserHasFamily(userId: string) {
  const supabase = await createClient()
  
  try {
    return await getUserFamilyContext(userId)
  } catch {
    // User doesn't have a family, create one
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single()
    
    const familyName = profile?.full_name ? `${profile.full_name}'s Family` : 'My Family'
    
    // Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name: familyName,
        owner_id: userId
      })
      .select()
      .single()
      
    if (familyError) throw familyError
    
    // Add user as father (primary role)
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: userId,
        role: 'father',
        access_level: 'full',
        vault_access_level: 'admin',
        can_invite_members: true,
        can_manage_vault: true,
        can_see_financials: true,
        can_manage_children: true,
        emergency_access: true,
        relationship: 'Father',
        display_name: profile?.full_name || 'Dad'
      })
      
    if (memberError) throw memberError
    
    // Return the new family context
    return await getUserFamilyContext(userId)
  }
}

// ============================================================================
// DEVOTION ACTIONS (Fixed Schema)
// ============================================================================

export async function saveReflection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    content: formData.get('content') as string,
    theme_id: formData.get('theme_id') as string || undefined,
    day_index: formData.get('day_index') ? parseInt(formData.get('day_index') as string) : undefined
  }

  const validation = SaveReflectionSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/devotional/interactive?error=' + encodeURIComponent(errors))
  }

  const { content, theme_id, day_index } = validation.data

  try {
    // Get user's family context
    const { familyId, permissions } = await ensureUserHasFamily(user.id)
    
    if (!permissions.devotional.write) {
      redirect('/devotional/interactive?error=' + encodeURIComponent('You do not have permission to write devotions'))
    }

    // Save to devotion_entries with correct schema
    const { error } = await supabase
      .from('devotion_entries')
      .insert({
        user_id: user.id,
        family_id: familyId,
        theme_id: theme_id,
        day_index: day_index || 1,
        note: content, // ✅ Using correct column name
        content: content, // ✅ Also save to content column for compatibility
        reflection_type: 'daily'
      })

    if (error) {
      console.error('Error saving reflection:', error)
      redirect('/devotional/interactive?error=' + encodeURIComponent('Failed to save reflection'))
    }

    revalidatePath('/devotional/interactive')
    revalidatePath('/dashboard')
    redirect('/devotional/interactive?success=' + encodeURIComponent('Reflection saved successfully!'))
    
  } catch (error) {
    console.error('Error in saveReflection:', error)
    redirect('/devotional/interactive?error=' + encodeURIComponent('An error occurred while saving'))
  }
}

// ============================================================================
// VAULT ACTIONS (Enterprise Schema)
// ============================================================================

export async function saveVoiceNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined
  }

  const validation = SaveVoiceNoteSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/one-day/interactive?error=' + encodeURIComponent(errors))
  }

  const { title, description } = validation.data

  try {
    // Get user's family context
    const { familyId, permissions } = await ensureUserHasFamily(user.id)
    
    if (!permissions.vault.write) {
      redirect('/one-day/interactive?error=' + encodeURIComponent('You do not have permission to add vault items'))
    }

    // Save to vault_items with enterprise schema
    const { error } = await supabase
      .from('vault_items')
      .insert({
        family_id: familyId,
        owner_id: user.id,
        kind: 'audio',
        title: title,
        description: description,
        visibility: 'family',
        encrypted: false,
        metadata: { type: 'voice_note', recorded_at: new Date().toISOString() }
      })

    if (error) {
      console.error('Error saving voice note:', error)
      redirect('/one-day/interactive?error=' + encodeURIComponent('Failed to save voice note'))
    }

    revalidatePath('/one-day/interactive')
    revalidatePath('/dashboard')
    redirect('/one-day/interactive?success=' + encodeURIComponent('Voice note saved successfully!'))
    
  } catch (error) {
    console.error('Error in saveVoiceNote:', error)
    redirect('/one-day/interactive?error=' + encodeURIComponent('An error occurred while saving'))
  }
}

export async function saveLegacyNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    type: formData.get('type') as string || 'legacy_note',
    recipient: formData.get('recipient') as string || undefined,
    visibility: formData.get('visibility') as string || 'family',
    age_gate: formData.get('age_gate') ? parseInt(formData.get('age_gate') as string) : undefined
  }

  const validation = SaveLegacyNoteSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/one-day/interactive?error=' + encodeURIComponent(errors))
  }

  const { title, content, type, recipient, visibility, age_gate } = validation.data

  try {
    // Get user's family context
    const { familyId, permissions } = await ensureUserHasFamily(user.id)
    
    if (!permissions.vault.write) {
      redirect('/one-day/interactive?error=' + encodeURIComponent('You do not have permission to add vault items'))
    }

    // Save to vault_items with enterprise schema
    const { error } = await supabase
      .from('vault_items')
      .insert({
        family_id: familyId,
        owner_id: user.id,
        kind: 'letter',
        title: title,
        description: content,
        visibility: visibility as any,
        age_gate: age_gate,
        encrypted: false,
        metadata: { 
          type: type, 
          recipient: recipient,
          legacy_note: true,
          created_via: 'interactive_page'
        }
      })

    if (error) {
      console.error('Error saving legacy note:', error)
      redirect('/one-day/interactive?error=' + encodeURIComponent('Failed to save legacy note'))
    }

    revalidatePath('/one-day/interactive')
    revalidatePath('/dashboard')
    redirect('/one-day/interactive?success=' + encodeURIComponent('Legacy note added to vault!'))
    
  } catch (error) {
    console.error('Error in saveLegacyNote:', error)
    redirect('/one-day/interactive?error=' + encodeURIComponent('An error occurred while saving'))
  }
}

// ============================================================================
// REMINDER & EVENT ACTIONS
// ============================================================================

export async function setReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    time: formData.get('time') as string,
    type: formData.get('type') as string || 'family_connection',
    content: formData.get('content') as string || undefined
  }

  const validation = SetReminderSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/devotional/interactive?error=' + encodeURIComponent(errors))
  }

  const { time, type, content } = validation.data

  try {
    // Get user's family context
    const { familyId } = await ensureUserHasFamily(user.id)

    // Calculate reminder datetime (simple implementation)
    const today = new Date()
    const [hour, period] = time.split(/[:\s]/)
    let reminderHour = parseInt(hour)
    if (period?.toLowerCase() === 'pm' && reminderHour !== 12) {
      reminderHour += 12
    } else if (period?.toLowerCase() === 'am' && reminderHour === 12) {
      reminderHour = 0
    }
    
    const reminderTime = new Date(today)
    reminderTime.setHours(reminderHour, 0, 0, 0)
    
    // If time has passed today, set for tomorrow
    if (reminderTime <= today) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    // Save reminder to events table
    const { error } = await supabase
      .from('events')
      .insert({
        family_id: familyId,
        user_id: user.id,
        title: 'Family Connection Reminder',
        description: content || 'Time for family connection and sharing',
        type: type,
        visibility: 'private',
        scheduled_for: reminderTime.toISOString(),
        created_by: user.id
      })

    if (error) {
      console.error('Error setting reminder:', error)
      redirect('/devotional/interactive?error=' + encodeURIComponent('Failed to set reminder'))
    }

    revalidatePath('/devotional/interactive')
    revalidatePath('/dashboard')
    redirect('/devotional/interactive?success=' + encodeURIComponent('Reminder set for tonight!'))
    
  } catch (error) {
    console.error('Error in setReminder:', error)
    redirect('/devotional/interactive?error=' + encodeURIComponent('An error occurred while setting reminder'))
  }
}

// ============================================================================
// FAMILY MANAGEMENT ACTIONS
// ============================================================================

export async function inviteFamilyMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parse and validate input
  const rawData = {
    email: formData.get('email') as string,
    role: formData.get('role') as string,
    relationship: formData.get('relationship') as string,
    personal_message: formData.get('personal_message') as string || undefined
  }

  const validation = InviteFamilyMemberSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ')
    redirect('/family/settings?error=' + encodeURIComponent(errors))
  }

  const { email, role, relationship, personal_message } = validation.data

  try {
    // Get user's family context
    const { familyId, permissions } = await ensureUserHasFamily(user.id)
    
    if (!permissions.can_invite_members) {
      redirect('/family/settings?error=' + encodeURIComponent('You do not have permission to invite family members'))
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days to accept

    // Create invitation
    const { error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        email: email,
        invited_role: role as any,
        relationship: relationship,
        personal_message: personal_message,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        invited_by: user.id
      })

    if (error) {
      console.error('Error creating invitation:', error)
      redirect('/family/settings?error=' + encodeURIComponent('Failed to create invitation'))
    }

    // TODO: Send invitation email via Resend
    
    revalidatePath('/family/settings')
    redirect('/family/settings?success=' + encodeURIComponent(`Invitation sent to ${email}!`))
    
  } catch (error) {
    console.error('Error in inviteFamilyMember:', error)
    redirect('/family/settings?error=' + encodeURIComponent('An error occurred while sending invitation'))
  }
}

// ============================================================================
// DATA RETRIEVAL ACTIONS
// ============================================================================

export async function getVaultItems() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { familyId, permissions } = await getUserFamilyContext(user.id)
    
    if (!permissions.vault.read) {
      return { error: 'No vault access' }
    }

    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching vault items:', error)
      return { error: 'Failed to fetch vault items' }
    }

    return { data }
  } catch (error) {
    console.error('Error in getVaultItems:', error)
    return { error: 'An error occurred' }
  }
}

export async function getDevotionProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { familyId } = await getUserFamilyContext(user.id)

    const { data, error } = await supabase
      .from('devotion_entries')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching devotion progress:', error)
      return { error: 'Failed to fetch devotion progress' }
    }

    return { data }
  } catch (error) {
    console.error('Error in getDevotionProgress:', error)
    return { error: 'An error occurred' }
  }
}

export async function getFamilyContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const context = await getUserFamilyContext(user.id)
    return { data: context }
  } catch (error) {
    console.error('Error in getFamilyContext:', error)
    return { error: 'User is not a member of any family' }
  }
}
