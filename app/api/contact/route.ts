/**
 * 💬 Contact Support API
 * Handles contact form submissions and sends notifications to admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Send email notification to admin
    const adminEmail = 'grant@agentanalyticsai.com'
    const emailSubject = subject 
      ? `Support Request: ${subject}` 
      : 'New Support Request from For One Day'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }
            .label { font-weight: bold; color: #374151; }
            .value { margin-bottom: 10px; color: #1f2937; }
            .message-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Support Request</h1>
              <p>From For One Day</p>
            </div>
            
            <div class="content">
              <div class="info-box">
                <h3>Contact Information</h3>
                <div class="value"><span class="label">Name:</span> ${name}</div>
                <div class="value"><span class="label">Email:</span> ${email}</div>
                ${subject ? `<div class="value"><span class="label">Subject:</span> ${subject}</div>` : ''}
              </div>
              
              <div class="info-box">
                <h3>Message</h3>
                <div class="message-box">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div class="footer">
                <p><strong>To respond:</strong> Simply reply to this email, and it will go directly to ${email}</p>
                <p>Sent via For One Day contact form</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    try {
      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml
      })

      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully. We\'ll respond within 24 hours.'
      })
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send message. Please try again or use the contact form.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

