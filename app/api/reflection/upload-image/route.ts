import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 📸 Reflection Image Upload API
 * Handles image uploads for daily reflections
 * Free for all users (drives daily engagement)
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB per image

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Only allow images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds limit of 5MB. Please compress your image.` 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const fileName = `${user.id}/reflections/${date}/${timestamp}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading reflection image:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload image. Please try again.' 
      }, { status: 500 })
    }

    // Get signed URL (valid for 1 hour - can be regenerated when needed)
    const { data: signedUrlData } = await supabase.storage
      .from('media')
      .createSignedUrl(uploadData.path, 3600) // 1 hour expiry

    return NextResponse.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      image: {
        storage_path: uploadData.path,
        url: signedUrlData?.signedUrl || null,
        mime_type: file.type,
        file_size_bytes: file.size
      }
    })

  } catch (error) {
    console.error('Error in reflection image upload API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

