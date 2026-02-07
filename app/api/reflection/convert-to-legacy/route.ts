import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkLegacyNoteLimit } from '@/lib/subscription-utils'

/**
 * Convert a daily reflection to a legacy note
 * POST /api/reflection/convert-to-legacy
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reflectionId, title, recipientName, recipientEmail } = await request.json()

    if (!reflectionId) {
      return NextResponse.json({ error: 'Reflection ID is required' }, { status: 400 })
    }

    // Get the reflection
    const { data: reflection, error: reflectionError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('id', reflectionId)
      .eq('user_id', user.id)
      .single()

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 })
    }

    // Check subscription limits
    const limitCheck = await checkLegacyNoteLimit(user.id)
    if (!limitCheck.canCreate) {
      return NextResponse.json({ 
        error: limitCheck.message || 'You have reached your legacy note limit. Please upgrade to Pro for unlimited notes.',
        upgradeRequired: true
      }, { status: 403 })
    }

    // Generate title if not provided
    const legacyTitle = title || `Reflection from ${new Date(reflection.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

    // Get media URLs if they exist
    let attachments: any[] = []
    if (reflection.media_urls && reflection.media_urls.length > 0) {
      // Generate signed URLs for attachments
      const attachmentPromises = reflection.media_urls.map(async (storagePath: string) => {
        const { data } = await supabase.storage
          .from('media')
          .createSignedUrl(storagePath, 3600)
        
        if (data?.signedUrl) {
          // Determine file type from storage path
          const isVideo = /\.(mp4|webm|mov)$/i.test(storagePath)
          return {
            storage_path: storagePath,
            type: isVideo ? 'video' : 'image',
            mime_type: isVideo ? 'video/mp4' : 'image/jpeg',
            filename: storagePath.split('/').pop() || 'attachment'
          }
        }
        return null
      })
      
      const attachmentResults = await Promise.all(attachmentPromises)
      attachments = attachmentResults.filter((a): a is any => a !== null)
    }

    // Create legacy note from reflection
    const { data: vaultItem, error: vaultError } = await supabase
      .from('vault_items')
      .insert({
        owner_id: user.id,
        kind: 'letter',
        title: legacyTitle,
        description: reflection.reflection.substring(0, 200) + (reflection.reflection.length > 200 ? '...' : ''),
        metadata: {
          content: reflection.reflection,
          recipient_name: recipientName || null,
          recipient_email: recipientEmail || null,
          template_type: 'reflection',
          is_shared: false,
          source_reflection_id: reflectionId, // Track where it came from
          source_date: reflection.date,
          attachments: attachments.length > 0 ? attachments : undefined
        }
      })
      .select()
      .single()

    if (vaultError) {
      console.error('Error creating legacy note:', vaultError)
      return NextResponse.json({ error: 'Failed to create legacy note' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      vaultItemId: vaultItem.id,
      message: 'Reflection converted to legacy note successfully' 
    })

  } catch (error) {
    console.error('Error in convert reflection to legacy API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
