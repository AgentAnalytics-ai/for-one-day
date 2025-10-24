'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createDebugContext, logError, logSuccess } from '@/lib/debug'
import { testDatabaseConnection, testEnvironmentVariables } from '@/lib/database-test'
import { checkLegacyNoteLimit } from '@/lib/subscription-utils'

/**
 * 📝 Simple User Actions - Core Devotional & Legacy Features
 * Clean, focused actions for the devotional-to-legacy flow
 */

// ============================================================================
// DEVOTIONAL ACTIONS
// ============================================================================

export async function saveReflection(formData: FormData) {
  const context = createDebugContext('saveReflection')
  
  // Step 1: Test environment variables
  logSuccess(context, 'Starting saveReflection action')
  const envTest = await testEnvironmentVariables()
  if (!envTest.success) {
    logError(context, 'Environment variables missing', new Error(`Missing: ${envTest.missing.join(', ')}`))
    redirect('/devotional?error=' + encodeURIComponent('Configuration error - missing environment variables'))
  }
  logSuccess(context, 'Environment variables validated')

  // Step 2: Initialize Supabase client
  const supabase = await createClient()
  logSuccess(context, 'Supabase client created')

  // Step 3: Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    logError(context, 'Authentication error', authError)
    redirect('/auth/login')
  }
  
  if (!user) {
    logError(context, 'No authenticated user', new Error('User is null'))
    redirect('/auth/login')
  }
  
  context.userId = user.id
  logSuccess(context, `User authenticated: ${user.id}`)

  // Step 4: Test database connection
  const dbTest = await testDatabaseConnection(user.id)
  if (!dbTest.success) {
    logError(context, 'Database test failed', new Error(dbTest.error || 'Unknown database error'))
    redirect('/devotional?error=' + encodeURIComponent('Database connection failed'))
  }
  logSuccess(context, 'Database connection verified')

  // Step 5: Parse form data
  const content = formData.get('content') as string
  const themeSlug = formData.get('themeId') as string || null
  const dayIndex = parseInt(formData.get('dayIndex') as string) || 1

  logSuccess(context, `Form data parsed - content length: ${content?.length || 0}, themeSlug: ${themeSlug}, dayIndex: ${dayIndex}`)

  if (!content?.trim()) {
    logError(context, 'Empty content provided', new Error('Content is empty'))
    redirect('/devotional?error=' + encodeURIComponent('Please write a reflection'))
  }

  // Step 5.5: Get theme UUID from slug
  let themeId: string | null = null
  if (themeSlug) {
    logSuccess(context, `Looking up theme by slug: ${themeSlug}`)
    const { data: theme, error: themeError } = await supabase
      .from('devotion_themes')
      .select('id')
      .eq('slug', themeSlug)
      .single()

    if (themeError) {
      logError(context, 'Error looking up theme', themeError)
      redirect('/devotional?error=' + encodeURIComponent('Theme not found'))
    }

    if (theme) {
      themeId = theme.id
      logSuccess(context, `Found theme with ID: ${themeId}`)
    }
  }

  // Step 6: Handle family setup
  logSuccess(context, 'Checking for existing family...')
  const { data: familyMember, error: familyQueryError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()

  if (familyQueryError && familyQueryError.code !== 'PGRST116') {
    logError(context, 'Error querying family members', familyQueryError)
    redirect('/devotional?error=' + encodeURIComponent('Database query failed'))
  }

  let finalFamilyMember = familyMember

  if (!familyMember) {
    logSuccess(context, 'No existing family found, creating new family...')
    
    // Create family if it doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      logError(context, 'Error fetching user profile', profileError)
      redirect('/devotional?error=' + encodeURIComponent('Profile not found'))
    }

    const familyName = profile?.full_name ? `${profile.full_name}'s Family` : 'My Family'
    logSuccess(context, `Creating family: ${familyName}`)
    
    const { data: family, error: familyCreateError } = await supabase
      .from('families')
      .insert({
        name: familyName,
        owner_id: user.id,
      })
      .select()
      .single()

    if (familyCreateError) {
      logError(context, 'Error creating family', familyCreateError)
      redirect('/devotional?error=' + encodeURIComponent('Failed to create family'))
    }

    if (family) {
      logSuccess(context, `Family created with ID: ${family.id}`)
      
      const { error: memberCreateError } = await supabase.from('family_members').insert({
        family_id: family.id,
        user_id: user.id,
        role: 'owner',
      })

      if (memberCreateError) {
        logError(context, 'Error creating family member', memberCreateError)
        redirect('/devotional?error=' + encodeURIComponent('Failed to create family member'))
      }
      
      finalFamilyMember = { family_id: family.id }
      logSuccess(context, 'Family member created successfully')
    }
  } else {
    logSuccess(context, `Existing family found: ${familyMember.family_id}`)
  }

  if (!finalFamilyMember) {
    logError(context, 'Unable to create or find family', new Error('Family setup failed'))
    redirect('/devotional?error=' + encodeURIComponent('Unable to create family'))
  }

  // Step 7: Save devotional reflection (upsert to handle duplicates)
  logSuccess(context, 'Saving reflection to database...')
  
  // First, try to find existing entry
  const { data: existingEntry, error: selectError } = await supabase
    .from('devotion_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('theme_id', themeId)
    .eq('day_index', dayIndex)
    .single()

  let error: Error | null = null

  // If selectError exists and it's not "no rows found", that's a real error
  if (selectError && selectError.code !== 'PGRST116') {
    logError(context, 'Error checking for existing entry', selectError)
    redirect('/devotional?error=' + encodeURIComponent(`Database error: ${selectError.message}`))
  }

  if (existingEntry) {
    // Update existing entry
    logSuccess(context, 'Updating existing reflection...')
    const { error: updateError } = await supabase
      .from('devotion_entries')
      .update({ 
        note: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingEntry.id)
    
    error = updateError
  } else {
    // Insert new entry
    logSuccess(context, 'Creating new reflection...')
    const { error: insertError } = await supabase
      .from('devotion_entries')
      .insert({
        user_id: user.id,
        family_id: finalFamilyMember.family_id,
        theme_id: themeId,
        day_index: dayIndex,
        note: content
      })
    
    error = insertError
  }

  if (error) {
    logError(context, 'Error saving reflection to database', error)
    redirect('/devotional?error=' + encodeURIComponent(`Failed to save reflection: ${error.message}`))
  }

  logSuccess(context, 'Reflection saved successfully!')
  
  // Step 8: Revalidate and redirect
  revalidatePath('/devotional')
  revalidatePath('/dashboard')
  redirect('/devotional?success=' + encodeURIComponent('Your reflection has been saved! ✨'))
}

// ============================================================================
// LEGACY VAULT ACTIONS
// ============================================================================

export async function saveLegacyNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const recipient = formData.get('recipient') as string || 'family'
  const occasion = formData.get('occasion') as string || 'general'
  const templateId = formData.get('template_id') as string || null

  if (!title?.trim() || !content?.trim()) {
    redirect('/vault?error=' + encodeURIComponent('Please provide both title and content'))
  }

  // 🚨 CRITICAL: Check subscription limits BEFORE saving
  const limitCheck = await checkLegacyNoteLimit(user.id)
  if (!limitCheck.canCreate) {
    redirect('/vault?error=' + encodeURIComponent(limitCheck.message || 'You have reached your legacy note limit. Please upgrade to Pro for unlimited notes.'))
  }

  try {
    // Get user's family, create if doesn't exist
    let { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      // Create family if it doesn't exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const familyName = profile?.full_name ? `${profile.full_name}'s Family` : 'My Family'
      
      const { data: family } = await supabase
        .from('families')
        .insert({
          name: familyName,
          owner_id: user.id,
        })
        .select()
        .single()

      if (family) {
        await supabase.from('family_members').insert({
          family_id: family.id,
          user_id: user.id,
          role: 'owner',
        })
        
        familyMember = { family_id: family.id }
      }
    }

    if (!familyMember) {
      redirect('/vault?error=' + encodeURIComponent('Unable to create family'))
    }

    // Save legacy note to vault
    const { data: vaultItem, error } = await supabase
      .from('vault_items')
      .insert({
        family_id: familyMember.family_id,
        owner_id: user.id,
        kind: 'letter',
        title: title,
        description: content,
        template_id: templateId,
        metadata: {
          recipient: recipient,
          occasion: occasion,
          created_via: templateId ? 'template_flow' : 'devotional_flow',
          legacy_note: true
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving legacy note:', error)
      redirect('/vault?error=' + encodeURIComponent('Failed to save legacy note'))
    }

    // Track template usage if template was used
    if (templateId && vaultItem) {
      await supabase
        .from('template_usage')
        .insert({
          user_id: user.id,
          template_id: templateId,
          vault_item_id: vaultItem.id
        })
    }

    revalidatePath('/vault')
    revalidatePath('/dashboard')
    redirect('/vault?success=' + encodeURIComponent('Your legacy note has been saved! 💝'))
    
  } catch (error) {
    console.error('Error in saveLegacyNote:', error)
    redirect('/vault?error=' + encodeURIComponent('An error occurred while saving'))
  }
}

// ============================================================================
// VAULT MANAGEMENT ACTIONS
// ============================================================================

export async function deleteVaultItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  try {
    // Verify ownership before deleting
    const { data: item, error: fetchError } = await supabase
      .from('vault_items')
      .select('owner_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      redirect('/vault?error=' + encodeURIComponent('Item not found'))
    }

    if (item.owner_id !== user.id) {
      redirect('/vault?error=' + encodeURIComponent('You can only delete your own items'))
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId)
      .eq('owner_id', user.id)

    if (deleteError) {
      console.error('Error deleting vault item:', deleteError)
      redirect('/vault?error=' + encodeURIComponent('Failed to delete item'))
    }

    revalidatePath('/vault')
    revalidatePath('/dashboard')
    redirect('/vault?success=' + encodeURIComponent('Item deleted successfully'))
    
  } catch (error) {
    console.error('Error in deleteVaultItem:', error)
    redirect('/vault?error=' + encodeURIComponent('An error occurred while deleting'))
  }
}

export async function updateVaultItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const itemId = formData.get('itemId') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const recipient = formData.get('recipient') as string || 'family'
  const occasion = formData.get('occasion') as string || 'general'

  if (!itemId || !title?.trim() || !content?.trim()) {
    redirect('/vault?error=' + encodeURIComponent('Please provide all required fields'))
  }

  try {
    // Verify ownership before updating
    const { data: item, error: fetchError } = await supabase
      .from('vault_items')
      .select('owner_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      redirect('/vault?error=' + encodeURIComponent('Item not found'))
    }

    if (item.owner_id !== user.id) {
      redirect('/vault?error=' + encodeURIComponent('You can only edit your own items'))
    }

    // Update the item
    const { error: updateError } = await supabase
      .from('vault_items')
      .update({
        title: title,
        description: content,
        metadata: {
          recipient: recipient,
          occasion: occasion,
          created_via: 'devotional_flow',
          legacy_note: true,
          updated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('owner_id', user.id)

    if (updateError) {
      console.error('Error updating vault item:', updateError)
      redirect('/vault?error=' + encodeURIComponent('Failed to update item'))
    }

    revalidatePath('/vault')
    revalidatePath('/dashboard')
    redirect('/vault?success=' + encodeURIComponent('Item updated successfully'))
    
  } catch (error) {
    console.error('Error in updateVaultItem:', error)
    redirect('/vault?error=' + encodeURIComponent('An error occurred while updating'))
  }
}

// ============================================================================
// REFLECTION MANAGEMENT ACTIONS
// ============================================================================

export async function deleteReflection(reflectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  try {
    // Verify ownership before deleting
    const { data: reflection, error: fetchError } = await supabase
      .from('devotion_entries')
      .select('user_id')
      .eq('id', reflectionId)
      .single()

    if (fetchError || !reflection) {
      redirect('/reflections?error=' + encodeURIComponent('Reflection not found'))
    }

    if (reflection.user_id !== user.id) {
      redirect('/reflections?error=' + encodeURIComponent('You can only delete your own reflections'))
    }

    // Delete the reflection
    const { error: deleteError } = await supabase
      .from('devotion_entries')
      .delete()
      .eq('id', reflectionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting reflection:', deleteError)
      redirect('/reflections?error=' + encodeURIComponent('Failed to delete reflection'))
    }

    revalidatePath('/reflections')
    revalidatePath('/dashboard')
    redirect('/reflections?success=' + encodeURIComponent('Reflection deleted successfully'))
    
  } catch (error) {
    console.error('Error in deleteReflection:', error)
    redirect('/reflections?error=' + encodeURIComponent('An error occurred while deleting'))
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function getUserFamily(userId: string) {
  const supabase = await createClient()
  
  const { data: familyMember } = await supabase
    .from('family_members')
    .select(`
      family_id,
      role,
      families (
        id,
        name,
        owner_id
      )
    `)
    .eq('user_id', userId)
    .single()

  return familyMember
}