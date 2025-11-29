import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkLegacyNoteLimit } from '@/lib/subscription-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits
    const limitCheck = await checkLegacyNoteLimit(user.id)
    if (!limitCheck.canCreate) {
      return NextResponse.json({ 
        error: limitCheck.message || 'You have reached your legacy note limit. Please upgrade to Pro for unlimited notes.',
        upgradeRequired: true
      }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const recipient = formData.get('recipient') as string
    const occasion = formData.get('occasion') as string
    const templateId = formData.get('template_id') as string
    const sharingSettings = formData.get('sharing_settings') as string
    const attachmentsJson = formData.get('attachments') as string // JSON array of attachment objects

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Parse sharing settings
    let parsedSharingSettings = {}
    if (sharingSettings) {
      try {
        parsedSharingSettings = JSON.parse(sharingSettings)
      } catch (e) {
        console.error('Error parsing sharing settings:', e)
      }
    }

    // Parse attachments (array of { storage_path, type, url, etc. })
    let attachments = []
    if (attachmentsJson) {
      try {
        attachments = JSON.parse(attachmentsJson)
      } catch (e) {
        console.error('Error parsing attachments:', e)
      }
    }

    // Create vault item
    const { data: vaultItem, error: vaultError } = await supabase
      .from('vault_items')
      .insert({
        owner_id: user.id,
        kind: 'letter',
        title,
        description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        sharing_settings: parsedSharingSettings,
        metadata: {
          recipient,
          occasion,
          template_id: templateId,
          content: content,
          is_shared: Object.keys(parsedSharingSettings).length > 0,
          attachments: attachments.length > 0 ? attachments : undefined // Only include if attachments exist
        }
      })
      .select()
      .single()

    if (vaultError) {
      console.error('Error creating vault item:', vaultError)
      return NextResponse.json({ error: 'Failed to save legacy note' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      vaultItemId: vaultItem.id,
      message: 'Legacy note saved successfully' 
    })

  } catch (error) {
    console.error('Error in save legacy note API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
