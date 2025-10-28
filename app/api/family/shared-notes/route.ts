import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      return NextResponse.json({ success: true, notes: [] })
    }

    // Get shared vault items from family
    const { data: sharedNotes, error: notesError } = await supabase
      .from('vault_items')
      .select(`
        *,
        profiles:owner_id (
          full_name
        )
      `)
      .eq('family_id', familyMember.family_id)
      .eq('metadata->is_shared', true)
      .order('created_at', { ascending: false })

    if (notesError) {
      console.error('Error fetching shared notes:', notesError)
      return NextResponse.json({ error: 'Failed to fetch shared notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true, notes: sharedNotes || [] })

  } catch (error) {
    console.error('Error in shared notes API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
