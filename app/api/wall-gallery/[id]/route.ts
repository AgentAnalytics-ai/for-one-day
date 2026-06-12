import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveFamilyId } from '@/lib/household'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: row, error: fetchError } = await supabase
      .from('family_wall_photos')
      .select('id, storage_path')
      .eq('id', id)
      .eq('family_id', familyId)
      .maybeSingle()

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('family_wall_photos')
      .delete()
      .eq('id', id)
      .eq('family_id', familyId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    await supabase.storage.from('media').remove([row.storage_path])

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
