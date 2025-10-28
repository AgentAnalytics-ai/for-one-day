/**
 * 📧 Spouse/Executor Notification API
 * Sends notifications when someone is designated as spouse/executor
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { type, contactEmail, contactName, userFullName } = await request.json()
    // const { type, contactEmail, contactName, relationship, userFullName } = await request.json() // Simplified - removed unused relationship

    if (!contactEmail || !contactName || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let emailSubject = ''
    let emailContent = ''

    if (type === 'spouse') {
      emailSubject = `${userFullName} has designated you as their emergency contact`
      emailContent = `
        <h1>You've been designated as an emergency contact</h1>
        <p>Hello ${contactName},</p>
        <p><strong>${userFullName}</strong> has designated you as their emergency contact for their For One Day legacy notes.</p>
        
        <h2>What this means:</h2>
        <ul>
          <li>You'll be contacted if something happens to ${userFullName}</li>
          <li>You may be granted access to their legacy notes and important messages</li>
          <li>You're part of their family's digital legacy plan</li>
        </ul>
        
        <h2>Why this matters:</h2>
        <p>For One Day helps people preserve their wisdom, love, and life lessons for their family. ${userFullName} is building a legacy of letters, advice, and memories that will last for generations.</p>
        
        <h2>Want to learn more?</h2>
        <p>Discover how you can create your own legacy for your family:</p>
        <a href="https://foroneday.app" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Learn About For One Day
        </a>
        
        <p>Best regards,<br>The For One Day Team</p>
      `
    } else if (type === 'executor') {
      emailSubject = `${userFullName} has designated you as their digital executor`
      emailContent = `
        <h1>You've been designated as a digital executor</h1>
        <p>Hello ${contactName},</p>
        <p><strong>${userFullName}</strong> has designated you as their executor/trustee for their For One Day digital legacy.</p>
        
        <h2>Your role:</h2>
        <ul>
          <li>You have legal authority to access their legacy notes</li>
          <li>You can help ensure their messages reach their intended family members</li>
          <li>You're part of their comprehensive legacy plan</li>
        </ul>
        
        <h2>What makes this special:</h2>
        <p>For One Day isn't just another app - it's a platform where people preserve their most important thoughts, wisdom, and love for their family. ${userFullName} is creating a lasting legacy that will impact generations.</p>
        
        <h2>As an executor, you might find value in:</h2>
        <ul>
          <li>Creating your own legacy notes for your family</li>
          <li>Understanding the importance of digital legacy planning</li>
          <li>Helping other families preserve their stories</li>
        </ul>
        
        <h2>Learn more about digital legacy:</h2>
        <a href="https://foroneday.app/executor/welcome?name=${contactName}&designated_by=${userFullName}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Learn About Your Role
        </a>
        
        <p>Thank you for being part of ${userFullName}'s legacy plan.<br>The For One Day Team</p>
      `
    }

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'For One Day <noreply@foroneday.app>',
      to: [contactEmail],
      subject: emailSubject,
      html: emailContent,
    })

    if (error) {
      console.error('Error sending notification email:', error)
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Error in spouse/executor notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
