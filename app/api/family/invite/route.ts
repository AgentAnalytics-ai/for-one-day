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

    const { name, email, role = 'spouse' } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Get user's profile for family name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const userName = profile?.full_name || 'A family member'

    // Get user's existing family or create one if they don't have one
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    let familyId = familyMember?.family_id

    // If user doesn't have a family, create one for them
    if (!familyMember) {
      // Create a new family
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert({
          name: `${profile?.full_name || 'My Family'}'s Family`,
          owner_id: user.id
        })
        .select('id')
        .single()

      if (familyError) {
        console.error('Error creating family:', familyError)
        return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
      }

      familyId = newFamily.id

          // Add user as owner of the new family
          const { error: memberError } = await supabase
            .from('family_members')
            .insert({
              family_id: familyId,
              user_id: user.id,
              role: 'owner'
            })

      if (memberError) {
        console.error('Error adding user to family:', memberError)
        return NextResponse.json({ error: 'Failed to add user to family' }, { status: 500 })
      }
    }

    // Get family details
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyId)
      .single()


    // Generate simple invitation token for email (not used in current implementation)
    // const invitationToken = randomBytes(32).toString('hex')

    // Send invitation email
    const { data, error } = await resend.emails.send({
      from: 'For One Day <hello@foroneday.app>',
      to: [email],
      subject: `You're invited to join ${family?.name || 'a family'} on For One Day`,
      html: `
        <h1>You're Invited, ${name.trim()}!</h1>
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
        <a href="https://foroneday.app/auth/signup?invite=${familyId}&role=${role}" 
           style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Accept Invitation
        </a>
        <p>If you have any questions, feel free to reach out to ${userName}.</p>
        <p>Welcome to the family, ${name.trim()}!<br>The For One Day Team</p>
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
