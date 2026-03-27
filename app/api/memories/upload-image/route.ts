import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller.' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/memories/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Memory image upload:', uploadError)
      return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
    }

    const { data: signedUrlData } = await supabase.storage
      .from('media')
      .createSignedUrl(uploadData.path, 3600)

    return NextResponse.json({
      success: true,
      image: {
        storage_path: uploadData.path,
        url: signedUrlData?.signedUrl || null,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
