/**
 * 🚨 Emergency Access Request API
 * Handles requests from family members for emergency vault access
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const accountHolderEmail = formData.get('account_holder_email') as string
    const requesterName = formData.get('requester_name') as string
    const requesterEmail = formData.get('requester_email') as string
    const requesterPhone = formData.get('requester_phone') as string
    const requesterRelationship = formData.get('requester_relationship') as string
    const requestReason = formData.get('request_reason') as string
    const additionalInfo = formData.get('additional_info') as string

    // Validate required fields
    if (!accountHolderEmail || !requesterName || !requesterEmail || !requesterRelationship || !requestReason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the user by email
    const { data: authUser } = await supabase.auth.admin.listUsers()
    const targetUser = authUser.users.find(u => u.email === accountHolderEmail)

    if (!targetUser) {
      // Don't reveal if user exists or not (security)
      // Still log the request for manual review
    }

    // Create emergency access request
    const { error: insertError } = await supabase
      .from('emergency_access_requests')
      .insert({
        user_id: targetUser?.id || null,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone || null,
        relationship: requesterRelationship,
        reason: `${requestReason}: ${additionalInfo || ''}`.trim(),
        status: 'pending'
      })

    if (insertError) {
      console.error('Error creating emergency access request:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit request. Please email support@foroneday.app directly.' },
        { status: 500 }
      )
    }

    // Send notification email to admin (support@foroneday.app)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-admin-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'emergency_access_request',
          accountHolderEmail,
          requesterName,
          requesterEmail,
          relationship: requesterRelationship,
          reason: requestReason
        })
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted successfully. We will contact you within 1-2 business days to verify your identity and process your request.'
    })

  } catch (error) {
    console.error('Emergency access request error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please email support@foroneday.app directly.' },
      { status: 500 }
    )
  }
}

