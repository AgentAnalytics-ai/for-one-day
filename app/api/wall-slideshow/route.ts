import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { resolveFamilyId } from '@/lib/household'
import { resolveHouseholdTimezone } from '@/lib/household-timezone'
import type { WallSlideshowImage } from '@/lib/wall-slideshow'

async function signGalleryPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string
): Promise<WallSlideshowImage[]> {
  const { data: rows, error } = await supabase
    .from('family_wall_photos')
    .select('id, storage_path')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    if (error.code === '42P01') return []
    throw error
  }

  const images: WallSlideshowImage[] = []
  for (const row of rows ?? []) {
    const { data: signed } = await supabase.storage
      .from('media')
      .createSignedUrl(row.storage_path, 3600)
    if (signed?.signedUrl) {
      images.push({ id: row.id, url: signed.signedUrl })
    }
  }
  return images
}

async function signLegacyMemoryPhotos(
  memberIds: string[],
  admin: NonNullable<ReturnType<typeof createServiceRoleClient>>
): Promise<WallSlideshowImage[]> {
  const { data: memories, error } = await admin
    .from('memories')
    .select('id, media_urls')
    .in('user_id', memberIds)
    .eq('wall_slideshow', true)
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) {
    if (error.code === '42703' || error.code === '42P01') return []
    throw error
  }

  const images: WallSlideshowImage[] = []
  for (const row of memories ?? []) {
    const paths = (row.media_urls as string[] | null) ?? []
    for (const path of paths) {
      if (!path) continue
      const { data: signed } = await admin.storage.from('media').createSignedUrl(path, 3600)
      if (signed?.signedUrl) {
        images.push({ id: `${row.id}-${path}`, url: signed.signedUrl })
      }
    }
  }
  return images
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
    const timezone = familyId
      ? await resolveHouseholdTimezone(supabase, familyId)
      : 'America/Chicago'

    if (!familyId) {
      return NextResponse.json({ images: [], timezone })
    }

    let images = await signGalleryPhotos(supabase, familyId)

    if (images.length === 0) {
      const { data: memberRows } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', familyId)
      const memberIds = (memberRows ?? []).map((m) => m.user_id)
      const admin = createServiceRoleClient()
      if (admin && memberIds.length > 0) {
        images = await signLegacyMemoryPhotos(memberIds, admin)
      }
    }

    return NextResponse.json({ images, timezone })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
