import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role = 'spouse' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      return NextResponse.json({ error: 'You must be part of a family to invite members' }, { status: 400 })
    }

    // Get family details
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyMember.family_id)
      .single()

    // Get user's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const userName = profile?.full_name || 'A family member'

    // Send invitation email
    const { data, error } = await resend.emails.send({
      from: 'For One Day <noreply@foroneday.app>',
      to: [email],
      subject: `You're invited to join ${family?.name || 'a family'} on For One Day`,
      html: `
        <h1>You're Invited!</h1>
        <p>${userName} has invited you to join their family on For One Day.</p>
        <p>For One Day helps families preserve their most important messages and memories through digital legacy notes.</p>
        <p>As a family member, you'll be able to:</p>
        <ul>
          <li>View shared legacy notes from your family</li>
          <li>Create your own legacy notes</li>
          <li>Participate in family reflections</li>
          <li>Access important family documents</li>
        </ul>
        <p>Click the link below to accept the invitation and create your account:</p>
        <a href="https://foroneday.app/auth/signup?invite=${familyMember.family_id}&role=${role}" 
           style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Accept Invitation
        </a>
        <p>If you have any questions, feel free to reach out to ${userName}.</p>
        <p>Welcome to the family!<br>The For One Day Team</p>
      `,
    })

    if (error) {
      console.error('Error sending invitation email:', error)
      return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Error in family invite API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
