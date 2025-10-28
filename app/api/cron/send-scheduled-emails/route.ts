import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get pending deliveries that are due
    const { data: pendingDeliveries, error } = await supabase
      .rpc('get_pending_deliveries')

    if (error) {
      console.error('Error fetching pending deliveries:', error)
      return NextResponse.json({ error: 'Failed to fetch pending deliveries' }, { status: 500 })
    }

    if (!pendingDeliveries || pendingDeliveries.length === 0) {
      return NextResponse.json({ 
        message: 'No pending deliveries',
        count: 0 
      })
    }

    const results = []
    
    for (const delivery of pendingDeliveries) {
      try {
        // Mark as processing
        await supabase
          .from('delivery_queue')
          .update({ 
            status: 'processing',
            last_attempt: new Date().toISOString()
          })
          .eq('id', delivery.queue_id)

        // Create email content based on legacy note type
        const emailContent = createEmailContent(delivery)

        // Send email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'For One Day <hello@foroneday.app>',
          to: [delivery.recipient_email],
          subject: `A Legacy Message for You - ${delivery.title}`,
          html: emailContent
        })

        if (emailError) {
          throw new Error(`Email send failed: ${emailError.message}`)
        }

        // Mark as sent
        await supabase
          .from('delivery_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', delivery.queue_id)

        // Update vault item status
        await supabase
          .from('vault_items')
          .update({ delivery_status: 'sent' })
          .eq('id', delivery.vault_item_id)

        // Record analytics
        await supabase
          .from('delivery_analytics')
          .insert({
            vault_item_id: delivery.vault_item_id,
            recipient_email: delivery.recipient_email,
            delivery_status: 'sent'
          })

        results.push({
          queue_id: delivery.queue_id,
          recipient_email: delivery.recipient_email,
          status: 'sent',
          email_id: emailData?.id
        })

      } catch (error) {
        console.error(`Error processing delivery ${delivery.queue_id}:`, error)
        
        // Mark as failed
        await supabase
          .from('delivery_queue')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            attempts: 1
          })
          .eq('id', delivery.queue_id)

        results.push({
          queue_id: delivery.queue_id,
          recipient_email: delivery.recipient_email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: results.length,
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function createEmailContent(delivery: {
  title: string
  content: string
  kind: string
  recipient_name: string
  delivery_message?: string
}): string {
  const { title, content, recipient_name, delivery_message } = delivery
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>A Legacy Message for You</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .message { background: #f8fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; font-weight: 600; }
        h2 { color: #2d3748; margin-top: 0; }
        p { margin: 16px 0; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📜 A Legacy Message for You</h1>
          <p>Someone who cares about you has scheduled this message to be delivered today.</p>
        </div>
        
        <div class="content">
          <h2>Dear ${recipient_name},</h2>
          
          <div class="highlight">
            <strong>Message Title:</strong> ${title}
          </div>
          
          ${delivery_message ? `
            <div class="message">
              <strong>Personal Message:</strong><br>
              ${delivery_message}
            </div>
          ` : ''}
          
          <div class="message">
            <strong>Legacy Note:</strong><br>
            ${content || 'This legacy note contains important content for you.'}
          </div>
          
          <p>This message was created and scheduled through <strong>For One Day</strong>, a platform designed to help families preserve and share their most important messages and memories.</p>
          
          <p>If you'd like to create your own legacy messages for your loved ones, you can learn more at <a href="https://foroneday.app">foroneday.app</a>.</p>
        </div>
        
        <div class="footer">
          <p>This message was delivered by For One Day</p>
          <p>If you have any questions, please contact us at hello@foroneday.app</p>
        </div>
      </div>
    </body>
    </html>
  `
}
