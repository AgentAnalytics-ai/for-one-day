import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface LegacyNoteEmailData {
  recipientName: string
  recipientEmail: string
  senderName: string
  noteTitle: string
  noteContent: string
  deliveryDate: string
  relationship: string
}

export async function sendLegacyNoteEmail(data: LegacyNoteEmailData) {
  if (!resend) {
    console.warn('Resend not configured, skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'For One Day <hello@foroneday.app>',
      to: [data.recipientEmail],
      subject: `A Legacy Note for You - ${data.noteTitle}`,
      html: generateLegacyNoteEmailHTML(data),
      text: generateLegacyNoteEmailText(data),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, messageId: emailData?.id, emailId: emailData?.id }
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

function generateLegacyNoteEmailHTML(data: LegacyNoteEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>A Legacy Note for You</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
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
        .subtitle {
          color: #6b7280;
          font-size: 16px;
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
        .relationship {
          background: #dbeafe;
          color: #1e40af;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">For One Day</div>
          <h1 class="title">A Legacy Note for You</h1>
          <p class="subtitle">A message from ${data.senderName}</p>
        </div>
        
        <div style="text-align: center;">
          <span class="relationship">${data.relationship}</span>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">${data.noteTitle}</h2>
        
        <div class="content">
${data.noteContent}
        </div>
        
        <div class="footer">
          <p>This legacy note was scheduled for delivery on ${new Date(data.deliveryDate).toLocaleDateString()} through For One Day.</p>
          <p>Live today. Prepare for the day that matters most.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateLegacyNoteEmailText(data: LegacyNoteEmailData): string {
  return `
A Legacy Note for You
From: ${data.senderName}
Relationship: ${data.relationship}
Title: ${data.noteTitle}

${data.noteContent}

---
This legacy note was scheduled for delivery on ${new Date(data.deliveryDate).toLocaleDateString()} through For One Day.
Live today. Prepare for the day that matters most.
  `.trim()
}
