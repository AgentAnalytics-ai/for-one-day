import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveFamilyId } from '@/lib/household'

export type WallGalleryPhoto = {
  id: string
  url: string
  storage_path: string
  created_at: string
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return NextResponse.json({ photos: [] as WallGalleryPhoto[] })
    }

    const { data: rows, error } = await supabase
      .from('family_wall_photos')
      .select('id, storage_path, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ photos: [] as WallGalleryPhoto[] })
      }
      console.error('wall-gallery GET:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const photos: WallGalleryPhoto[] = []

    for (const row of rows ?? []) {
      const { data: signed } = await supabase.storage
        .from('media')
        .createSignedUrl(row.storage_path, 3600)
      if (signed?.signedUrl) {
        photos.push({
          id: row.id,
          url: signed.signedUrl,
          storage_path: row.storage_path,
          created_at: row.created_at,
        })
      }
    }

    return NextResponse.json({ photos, count: photos.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return NextResponse.json({ error: 'No household found' }, { status: 400 })
    }

    const body = await request.json()
    const storage_paths = Array.isArray(body.storage_paths)
      ? body.storage_paths.filter((p: unknown) => typeof p === 'string' && p.length > 0)
      : []

    if (storage_paths.length === 0) {
      return NextResponse.json({ error: 'Add at least one photo' }, { status: 400 })
    }

    const rows = storage_paths.map((storage_path: string) => ({
      family_id: familyId,
      storage_path,
      created_by: user.id,
    }))

    const { data, error } = await supabase
      .from('family_wall_photos')
      .upsert(rows, { onConflict: 'family_id,storage_path', ignoreDuplicates: true })
      .select('id, storage_path, created_at')

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Run supabase/migrations/013_family_wall_photos.sql in Supabase.' },
          { status: 500 }
        )
      }
      console.error('wall-gallery POST:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ added: data?.length ?? 0, photos: data ?? [] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
