import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_BYTES = 2 * 1024 * 1024 // cropped JPEG should be well under this
const KINDS = new Set(['children', 'loved-ones'])

/**
 * Authenticated upload of a cropped profile image to the private `vault` bucket.
 * Object key: `{userId}/profiles/{kind}/{timestamp}.jpg` (matches storage RLS).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const kind = formData.get('kind') as string | null

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 })
    }
    if (!kind || !KINDS.has(kind)) {
      return NextResponse.json({ error: 'Invalid kind.' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image is too large after processing. Try a smaller file.' },
        { status: 400 }
      )
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const path = `${user.id}/profiles/${kind}/${Date.now()}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from('vault')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('profile-photo upload:', uploadError)
      return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
    }

    return NextResponse.json({
      path: data.path,
    })
  } catch (e) {
    console.error('profile-photo route:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
