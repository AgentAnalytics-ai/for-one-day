import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('memory_people')
      .select('id, display_name, relationship, sort_order, created_at')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('display_name', { ascending: true })

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

    return NextResponse.json({ people: data ?? [] })
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
    const display_name = typeof body.display_name === 'string' ? body.display_name.trim() : ''
    const relationship = typeof body.relationship === 'string' ? body.relationship.trim() : null

    if (!display_name || display_name.length > 120) {
      return NextResponse.json({ error: 'display_name is required (max 120 chars)' }, { status: 400 })
    }

    const { count } = await supabase
      .from('memory_people')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const sort_order = (count ?? 0) + 1

    const { data, error } = await supabase
      .from('memory_people')
      .insert({
        user_id: user.id,
        display_name,
        relationship: relationship || null,
        sort_order,
      })
      .select('id, display_name, relationship, sort_order, created_at')
      .single()

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

    return NextResponse.json({ person: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
