import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ success: true, members: [] })
    }

    // Get all family members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('family_id', familyMember.family_id)

    if (membersError) {
      console.error('Error fetching family members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
    }

    return NextResponse.json({ success: true, members: members || [] })

  } catch (error) {
    console.error('Error in family members API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
