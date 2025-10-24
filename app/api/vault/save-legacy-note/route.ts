import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const recipient = formData.get('recipient') as string
    const occasion = formData.get('occasion') as string
    const templateId = formData.get('template_id') as string

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Get user's family
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get or create family
    let familyId = null
    if (profile.family_id) {
      familyId = profile.family_id
    } else {
      // Create a family for the user
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: `${profile.full_name || 'My'} Family`,
          owner_id: user.id
        })
        .select()
        .single()

      if (familyError) {
        console.error('Error creating family:', familyError)
        return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
      }

      familyId = family.id

      // Update profile with family_id
      await supabase
        .from('profiles')
        .update({ family_id: familyId })
        .eq('user_id', user.id)
    }

    // Create vault item
    const { data: vaultItem, error: vaultError } = await supabase
      .from('vault_items')
      .insert({
        family_id: familyId,
        owner_id: user.id,
        kind: 'letter',
        title,
        description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        metadata: {
          recipient,
          occasion,
          template_id: templateId,
          content: content
        }
      })
      .select()
      .single()

    if (vaultError) {
      console.error('Error creating vault item:', vaultError)
      return NextResponse.json({ error: 'Failed to save legacy note' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      vaultItemId: vaultItem.id,
      message: 'Legacy note saved successfully' 
    })

  } catch (error) {
    console.error('Error in save legacy note API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
