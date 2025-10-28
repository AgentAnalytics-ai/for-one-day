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
      return NextResponse.json({ success: true, members: [] })
    }

    // Get all family members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role,
        invitation_status,
        joined_at,
        invited_at,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('family_id', familyMember.family_id)

    if (membersError) {
      console.error('Error fetching family members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
    }

    // Format members data
    const formattedMembers = members.map(member => ({
      user_id: member.user_id,
      full_name: (member.profiles as { full_name: string; email: string }[])[0]?.full_name || 'Unknown',
      email: (member.profiles as { full_name: string; email: string }[])[0]?.email || 'Unknown',
      role: member.role,
      invitation_status: member.invitation_status,
      joined_at: member.joined_at,
      invited_at: member.invited_at
    }))

    return NextResponse.json({ success: true, members: formattedMembers })

  } catch (error) {
    console.error('Error in family members API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
