import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personId = request.nextUrl.searchParams.get('person_id')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '100', 10) || 100, 100)
    const sign = request.nextUrl.searchParams.get('sign') === '1'

    let q = supabase
      .from('memories')
      .select(`
        id,
        person_id,
        body_text,
        polished_text,
        media_urls,
        created_at,
        memory_people ( display_name )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (personId) {
      q = q.eq('person_id', personId)
    }

    const { data, error } = await q

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Run supabase/add-memory-people-and-memories.sql in Supabase.', code: 'TABLE_MISSING' },
          { status: 500 }
        )
      }
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = data ?? []
    if (!sign || rows.length === 0) {
      return NextResponse.json({ memories: rows })
    }

    const enriched = await Promise.all(
      rows.map(async (row) => {
        const paths = row.media_urls as string[] | null
        const first = paths?.[0]
        if (!first) return { ...row, preview_url: null as string | null }
        const { data: signed } = await supabase.storage.from('media').createSignedUrl(first, 3600)
        return { ...row, preview_url: signed?.signedUrl ?? null }
      })
    )

    return NextResponse.json({ memories: enriched })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const person_id = typeof body.person_id === 'string' ? body.person_id : ''
    const body_text = typeof body.body_text === 'string' ? body.body_text.trim() : ''
    const media_urls = Array.isArray(body.media_urls)
      ? body.media_urls.filter((p: unknown) => typeof p === 'string')
      : []
    const polished_text =
      typeof body.polished_text === 'string' && body.polished_text.trim()
        ? body.polished_text.trim()
        : null

    if (!person_id) {
      return NextResponse.json({ error: 'person_id is required' }, { status: 400 })
    }
    if (!body_text && media_urls.length === 0) {
      return NextResponse.json({ error: 'Add a note or at least one photo' }, { status: 400 })
    }

    const { data: person, error: pe } = await supabase
      .from('memory_people')
      .select('id')
      .eq('id', person_id)
      .eq('user_id', user.id)
      .single()

    if (pe || !person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        person_id,
        body_text: body_text || '',
        media_urls,
        polished_text,
      })
      .select('id, person_id, body_text, polished_text, media_urls, created_at')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ memory: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
