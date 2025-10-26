import { Resend } from 'resend'

/**
 * 📧 Email sending via Resend
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping email')
    return null
  }

  try {
    const fromEmail = process.env.FROM_EMAIL || 'hello@foroneday.app'
    const data = await resend.emails.send({
      from: `For One Day <${fromEmail}>`,
      to,
      subject,
      html,
      replyTo: fromEmail,
    })
    
    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

/**
 * Emergency access notification email
 */
export async function sendEmergencyAccessNotification({
  requestId,
  accountHolderName,
  accountHolderEmail,
  requesterName,
  requesterEmail,
  requesterRelationship,
  requestReason,
  additionalInfo,
  requesterPhone,
}: {
  requestId: string
  accountHolderName: string
  accountHolderEmail: string
  requesterName: string
  requesterEmail: string
  requesterRelationship: string
  requestReason: string
  additionalInfo: string
  requesterPhone: string
}) {
  const subject = `🚨 Emergency Access Request - ${accountHolderName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-bottom: 10px; }
          .urgent { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Emergency Access Request</h1>
            <p>Request ID: ${requestId}</p>
          </div>
          
          <div class="content">
            <p class="urgent">URGENT: Emergency access request requires immediate attention</p>
            
            <div class="info-box">
              <h3>Account Holder Information</h3>
              <div class="value"><span class="label">Name:</span> ${accountHolderName}</div>
              <div class="value"><span class="label">Email:</span> ${accountHolderEmail}</div>
            </div>
            
            <div class="info-box">
              <h3>Requester Information</h3>
              <div class="value"><span class="label">Name:</span> ${requesterName}</div>
              <div class="value"><span class="label">Email:</span> ${requesterEmail}</div>
              <div class="value"><span class="label">Phone:</span> ${requesterPhone || 'Not provided'}</div>
              <div class="value"><span class="label">Relationship:</span> ${requesterRelationship}</div>
            </div>
            
            <div class="info-box">
              <h3>Request Details</h3>
              <div class="value"><span class="label">Reason:</span> ${requestReason}</div>
              <div class="value"><span class="label">Additional Information:</span></div>
              <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 5px;">
                ${additionalInfo || 'No additional information provided'}
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f59e0b;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Next Steps:</h4>
              <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Verify the requester's identity and relationship</li>
                <li>Contact the account holder if possible</li>
                <li>Review the user's emergency contact settings</li>
                <li>Process the request within 1-2 business days</li>
              </ol>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This request was submitted through the For One Day emergency access system.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  // Send to support email
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@foroneday.app'
  
  return await sendEmail({
    to: supportEmail,
    subject,
    html,
  })
}

/**
 * Weekly digest email template
 */
export function weeklyDigestEmail(
  userName: string,
  summary: string,
  deckReady: boolean
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Georgia, serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; color: #f08030; }
          .summary { background: #fef7f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta { text-align: center; margin: 30px 0; }
          .button { background: #f08030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">For One Day</h1>
            <p>Your weekly reflection</p>
          </div>
          
          <p>Hi ${userName},</p>
          
          <p>You completed another week of intentional living. Here's your weekly reflection:</p>
          
          <div class="summary">
            ${summary}
          </div>
          
          ${deckReady ? `
            <div class="cta">
              <p><strong>🎮 Your Table Talk deck is ready!</strong></p>
              <p>Gather your family for Sunday dinner and play together.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://foroneday.app'}/table-talk" class="button">Start Table Talk →</a>
            </div>
          ` : ''}
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            Keep preparing for One Day,<br>
            The For One Day Team
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Welcome email for new users
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  const subject = 'Welcome to For One Day!'
  
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 16px;">
        Welcome to For One Day, ${name}!
      </h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thank you for joining us. You're now part of a community dedicated to preserving 
        what matters most - your legacy, your wisdom, and your love for your family.
      </p>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 12px;">
          Getting Started
        </h2>
        <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Create your first legacy note for someone you love</li>
          <li>Start your daily reflection journey</li>
          <li>Invite family members to join your legacy</li>
        </ul>
      </div>
      
      <a href="https://foroneday.app/dashboard" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0;">
        Go to Dashboard
      </a>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      
      <p style="color: #6b7280; font-size: 12px; text-align: center; margin-bottom: 8px;">
        This is a transactional email from For One Day.
      </p>
      
      <p style="color: #6b7280; font-size: 12px; text-align: center; margin-bottom: 16px;">
        Questions? Reply to this email - we're here to help.
      </p>
      
      <p style="color: #6b7280; font-size: 12px; text-align: center;">
        <a href="https://foroneday.app/unsubscribe?email=${encodeURIComponent(to)}" 
           style="color: #6b7280; text-decoration: underline;">
          Unsubscribe from emails
        </a>
      </p>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        With gratitude,<br>
        The For One Day Team
      </p>
    </div>
  `
  
  return sendEmail({ to, subject, html })
}

