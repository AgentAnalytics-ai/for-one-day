import { Resend } from 'resend'
import { env } from '@/lib/env'

/**
 * 📧 Email sending via Resend
 */

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

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
      from: env.FROM_EMAIL || 'hello@foroneday.app',
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
              <a href="${env.NEXT_PUBLIC_SITE_URL}/table-talk" class="button">Start Table Talk →</a>
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

