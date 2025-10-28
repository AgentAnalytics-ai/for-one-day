import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Meta Expert Validation Schema
const ScheduleDeliverySchema = z.object({
  vault_item_id: z.string().uuid(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1),
  delivery_message: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ScheduleDeliverySchema.parse(body)

    // Verify user owns the vault item
    const { data: vaultItem, error: vaultError } = await supabase
      .from('vault_items')
      .select('id, owner_id, title')
      .eq('id', validatedData.vault_item_id)
      .eq('owner_id', user.id)
      .single()

    if (vaultError || !vaultItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 })
    }

    // Update vault item with scheduling info
    const { error: updateError } = await supabase
      .from('vault_items')
      .update({
        scheduled_delivery_date: validatedData.scheduled_date,
        scheduled_delivery_time: validatedData.scheduled_time,
        delivery_status: 'scheduled',
        recipient_email: validatedData.recipient_email,
        recipient_name: validatedData.recipient_name,
        delivery_message: validatedData.delivery_message || null
      })
      .eq('id', validatedData.vault_item_id)

    if (updateError) {
      console.error('Error scheduling delivery:', updateError)
      return NextResponse.json({ error: 'Failed to schedule delivery' }, { status: 500 })
    }

    // Add recipient to user's recipient list if not exists
    const { error: recipientError } = await supabase
      .from('delivery_recipients')
      .upsert({
        user_id: user.id,
        email: validatedData.recipient_email,
        name: validatedData.recipient_name,
        relationship: 'other'
      }, {
        onConflict: 'user_id,email'
      })

    if (recipientError) {
      console.error('Error saving recipient:', recipientError)
      // Don't fail the request for this
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Legacy note scheduled for delivery',
      scheduled_for: `${validatedData.scheduled_date} at ${validatedData.scheduled_time}`
    })

  } catch (error) {
    console.error('Schedule delivery error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's scheduled deliveries
    const { data: scheduledDeliveries, error } = await supabase
      .from('vault_items')
      .select(`
        id,
        title,
        kind,
        scheduled_delivery_date,
        scheduled_delivery_time,
        delivery_status,
        recipient_email,
        recipient_name,
        delivery_message,
        created_at
      `)
      .eq('owner_id', user.id)
      .in('delivery_status', ['scheduled', 'sent', 'failed'])
      .order('scheduled_delivery_date', { ascending: true })

    if (error) {
      console.error('Error fetching scheduled deliveries:', error)
      return NextResponse.json({ error: 'Failed to fetch scheduled deliveries' }, { status: 500 })
    }

    return NextResponse.json({ scheduled_deliveries: scheduledDeliveries })

  } catch (error) {
    console.error('Get scheduled deliveries error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
