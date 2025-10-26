import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

/**
 * 📧 Welcome Email API
 * Sends welcome email to new users via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    await sendWelcomeEmail({ to: email, name: name || 'there' })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

