/**
 * 💝 Legacy Vault Items API
 * Manages legacy notes in the vault
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's legacy notes
    const { data: vaultItems, error: vaultError } = await supabase
      .from('vault_items')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (vaultError) {
      console.error('Error fetching vault items:', vaultError)
      return NextResponse.json({ error: 'Failed to fetch vault items' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      items: vaultItems || []
    })

  } catch (error) {
    console.error('Error in vault items GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vault items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { title, content, template_type, recipient_name, recipient_email } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check if user has reached their limit (free users get 5 notes)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, family_id, full_name')
      .eq('user_id', user.id)
      .single()

    if (profile?.plan === 'free') {
      const { data: existingNotes } = await supabase
        .from('vault_items')
        .select('id')
        .eq('owner_id', user.id)

      if (existingNotes && existingNotes.length >= 5) {
        return NextResponse.json({ 
          error: 'You\'ve reached your limit of 5 legacy notes. Upgrade to Pro for unlimited notes.' 
        }, { status: 403 })
      }
    }

    // Create the legacy note
    const { data: vaultItem, error: createError } = await supabase
      .from('vault_items')
      .insert({
        owner_id: user.id,
        kind: 'letter',
        title: title.trim(),
        description: content.trim().substring(0, 200) + (content.trim().length > 200 ? '...' : ''),
        metadata: {
          content: content.trim(),
          template_type: template_type || null,
          recipient_name: recipient_name?.trim() || null,
          recipient_email: recipient_email?.trim() || null,
          is_shared: false
        }
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating vault item:', createError)
      return NextResponse.json({ error: 'Failed to create legacy note' }, { status: 500 })
    }

    // Update user stats - increment total legacy notes
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('total_legacy_notes')
      .eq('user_id', user.id)
      .single()

    const newTotal = (existingStats?.total_legacy_notes || 0) + 1

    await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_legacy_notes: newTotal,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    return NextResponse.json({
      success: true,
      item: vaultItem,
      message: 'Legacy note created successfully!'
    })

  } catch (error) {
    console.error('Error in vault items POST:', error)
    return NextResponse.json(
      { error: 'Failed to create legacy note' },
      { status: 500 }
    )
  }
}
