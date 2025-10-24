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
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@foroneday.app',
      to,
      subject,
      html,
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

