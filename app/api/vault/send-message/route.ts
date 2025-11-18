/**
 * 📧 Send Unsent Message API
 * Sends a message to a child's email via Resend
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Get the message
    const { data: message, error: messageError } = await supabase
      .from('unsent_messages')
      .select('*, loved_ones(email_address)')
      .eq('id', messageId)
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Get email address
    let recipientEmail: string | null = null

    if (message.loved_one_id) {
      const { data: account } = await supabase
        .from('loved_ones')
        .select('email_address')
        .eq('id', message.loved_one_id)
        .single()

      recipientEmail = account?.email_address || null
    }

    if (!recipientEmail) {
      return NextResponse.json({ 
        error: 'No email account found for this loved one. Please create one in Settings.' 
      }, { status: 400 })
    }

    // Get user's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const senderName = profile?.full_name || 'Your loved one'

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin: 30px 0;
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">For One Day</div>
            <h1 class="title">A Message for You</h1>
            <p style="color: #6b7280;">From ${senderName}</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">${message.message_title || `A Letter for ${message.recipient_name}`}</h2>
          
          <div class="content">
${message.message_content}
          </div>
          
          <div class="footer">
            <p>This message was sent through For One Day.</p>
            <p>Live today. Prepare for the day that matters most.</p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      await sendEmail({
        to: recipientEmail,
        subject: message.message_title || `A Message for ${message.recipient_name}`,
        html: emailHtml
      })

      // Update message status
      await supabase
        .from('unsent_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', messageId)

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully!'
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({
        error: 'Failed to send email. Please try again.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

