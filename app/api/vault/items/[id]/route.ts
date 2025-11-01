import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, recipient, occasion, sharing_settings } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Verify user owns this item
    const { data: existingItem, error: fetchError } = await supabase
      .from('vault_items')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (existingItem.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update vault item
    const { data: vaultItem, error: updateError } = await supabase
      .from('vault_items')
      .update({
        title,
        description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        sharing_settings,
        metadata: {
          recipient,
          occasion,
          content,
          is_shared: Object.keys(sharing_settings || {}).length > 0
        }
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating vault item:', updateError)
      return NextResponse.json({ error: 'Failed to update legacy note' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      vaultItemId: vaultItem.id,
      message: 'Legacy note updated successfully' 
    })

  } catch (error) {
    console.error('Error in update legacy note API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

