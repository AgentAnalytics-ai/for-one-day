/**
 * 🚨 Emergency Access Request API
 * Public form: resolves account holder when possible, logs request, notifies support via Resend.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findUserIdByEmail } from '@/lib/auth-admin'
import { sendEmergencyAccessNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const accountHolderEmail = (formData.get('account_holder_email') as string)?.trim()
    const requesterName = (formData.get('requester_name') as string)?.trim()
    const requesterEmail = (formData.get('requester_email') as string)?.trim()
    const requesterPhone = (formData.get('requester_phone') as string)?.trim()
    const requesterRelationship = (formData.get('requester_relationship') as string)?.trim()
    const requestReason = (formData.get('request_reason') as string)?.trim()
    const additionalInfo = (formData.get('additional_info') as string)?.trim()

    if (
      !accountHolderEmail ||
      !requesterName ||
      !requesterEmail ||
      !requesterRelationship ||
      !requestReason
    ) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const userId = await findUserIdByEmail(accountHolderEmail)

    const supabase = await createClient()

    const { data: inserted, error: insertError } = await supabase
      .from('emergency_access_requests')
      .insert({
        user_id: userId,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone || null,
        relationship: requesterRelationship,
        reason: `${requestReason}: ${additionalInfo || ''}`.trim(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating emergency access request:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to submit request. Please email support@foroneday.app directly.',
        },
        { status: 500 }
      )
    }

    const requestId = inserted?.id ?? 'pending'
    const accountHolderLabel = accountHolderEmail.split('@')[0] || 'Account holder'

    try {
      await sendEmergencyAccessNotification({
        requestId,
        accountHolderName: accountHolderLabel,
        accountHolderEmail,
        requesterName,
        requesterEmail,
        requesterRelationship,
        requestReason,
        additionalInfo: additionalInfo || '',
        requesterPhone: requesterPhone || '',
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      message:
        'Your request has been submitted successfully. We will contact you within 1-2 business days to verify your identity and process your request.',
    })
  } catch (error) {
    console.error('Emergency access request error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please email support@foroneday.app directly.',
      },
      { status: 500 }
    )
  }
}
