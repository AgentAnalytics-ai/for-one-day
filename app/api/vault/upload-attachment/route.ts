import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkLegacyNoteLimit, getUserSubscriptionStatus } from '@/lib/subscription-utils'

/**
 * 📎 Legacy Letter Attachment Upload API
 * Handles images and videos for legacy letters
 * Images: Free users can add up to 3 per letter
 * Videos: Pro-only feature
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for free users
const MAX_IMAGE_SIZE_PRO = 10 * 1024 * 1024 // 10MB for Pro users
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB for Pro users

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user subscription status
    const subscription = await getUserSubscriptionStatus(user.id)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vaultItemId = formData.get('vault_item_id') as string // Optional - for editing existing letters

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Determine file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images and videos are allowed.' 
      }, { status: 400 })
    }

    // Check video restrictions (Pro-only)
    if (isVideo && subscription.limits.legacyNotes !== -1) {
      return NextResponse.json({ 
        error: 'Video attachments are available for Pro members. Upgrade to Pro to add videos to your legacy letters.',
        upgradeRequired: true
      }, { status: 403 })
    }

    // Check file size limits
    const maxSize = isVideo 
      ? MAX_VIDEO_SIZE 
      : (subscription.plan === 'pro' || subscription.plan === 'lifetime' 
          ? MAX_IMAGE_SIZE_PRO 
          : MAX_IMAGE_SIZE)

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json({ 
        error: `File size exceeds limit of ${maxSizeMB}MB. ${subscription.plan === 'free' ? 'Upgrade to Pro for larger file sizes.' : ''}`,
        upgradeRequired: subscription.plan === 'free'
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
    const timestamp = Date.now()
    const fileName = vaultItemId
      ? `${user.id}/letters/${vaultItemId}/${timestamp}.${fileExt}`
      : `${user.id}/letters/temp/${timestamp}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vault')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading attachment:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file. Please try again.' 
      }, { status: 500 })
    }

    // Get signed URL (valid for 1 hour - can be regenerated when needed)
    const { data: signedUrlData } = await supabase.storage
      .from('vault')
      .createSignedUrl(uploadData.path, 3600) // 1 hour expiry

    return NextResponse.json({ 
      success: true, 
      message: 'Attachment uploaded successfully',
      attachment: {
        storage_path: uploadData.path,
        url: signedUrlData?.signedUrl || null,
        type: isImage ? 'image' : 'video',
        mime_type: file.type,
        file_size_bytes: file.size,
        filename: file.name
      }
    })

  } catch (error) {
    console.error('Error in attachment upload API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

