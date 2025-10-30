import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkVoiceRecordingLimit } from '@/lib/subscription-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits - voice recordings are Pro-only
    const limitCheck = await checkVoiceRecordingLimit(user.id)
    if (!limitCheck.canCreate) {
      return NextResponse.json({ 
        error: limitCheck.message || 'Voice recordings are available for Pro members. Upgrade to Pro to record and save voice messages.',
        upgradeRequired: true
      }, { status: 403 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = audioFile.name.split('.').pop() || 'webm'
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vault')
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('vault')
      .getPublicUrl(fileName)

    // Save to vault_items
    const { data: vaultItem, error: saveError } = await supabase
      .from('vault_items')
      .insert({
        owner_id: user.id,
        kind: 'audio',
        title: title.trim(),
        description: content.trim().substring(0, 200) + (content.trim().length > 200 ? '...' : ''),
        storage_path: uploadData.path,
        file_size_bytes: audioFile.size,
        mime_type: audioFile.type,
        metadata: {
          content: content.trim(),
          audio_url: urlData.publicUrl,
          is_shared: false
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving voice note:', saveError)
      return NextResponse.json({ error: 'Failed to save voice note' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Voice note saved successfully',
      vaultItemId: vaultItem.id,
      audioUrl: urlData.publicUrl
    })

  } catch (error) {
    console.error('Error in voice upload API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
