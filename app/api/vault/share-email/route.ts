import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vault_item_id, recipient_email } = await request.json()

    if (!vault_item_id || !recipient_email) {
      return NextResponse.json({ 
        error: 'Vault item ID and recipient email are required' 
      }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipient_email)) {
      return NextResponse.json({ 
        error: 'Invalid email address' 
      }, { status: 400 })
    }

    // Fetch vault item
    const { data: vaultItem, error: itemError } = await supabase
      .from('vault_items')
      .select('*')
      .eq('id', vault_item_id)
      .eq('owner_id', user.id)
      .single()

    if (itemError || !vaultItem) {
      return NextResponse.json({ 
        error: 'Legacy note not found' 
      }, { status: 404 })
    }

    // Get sender's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const senderName = profile?.full_name || 'Someone'

    // Generate signed URLs for attachments (7 day expiry)
    const attachmentLinks: Array<{ url: string; type: string }> = []
    if (vaultItem.metadata?.attachments && Array.isArray(vaultItem.metadata.attachments)) {
      for (const attachment of vaultItem.metadata.attachments) {
        try {
          const { data } = await supabase.storage
            .from('vault')
            .createSignedUrl(attachment.storage_path, 3600 * 24 * 7) // 7 days
          
          if (data?.signedUrl) {
            attachmentLinks.push({
              url: data.signedUrl,
              type: attachment.type || 'file'
            })
          }
        } catch (error) {
          console.error('Error generating signed URL for attachment:', error)
          // Continue without this attachment
        }
      }
    }

    // Create email HTML
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://foroneday.app'
    const emailHtml = createShareEmailTemplate({
      senderName,
      letterTitle: vaultItem.title,
      letterContent: vaultItem.metadata?.content || vaultItem.description || '',
      attachmentLinks,
      siteUrl
    })

    // Send email
    try {
      const emailResult = await sendEmail({
        to: recipient_email,
        subject: `${senderName} shared a legacy note with you`,
        html: emailHtml
      })
      
      // Log for debugging (remove in production if needed)
      console.log('Email sent successfully:', emailResult)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Return more detailed error for debugging
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
      return NextResponse.json({ 
        error: `Failed to send email: ${errorMessage}`,
        details: emailError instanceof Error ? emailError.stack : undefined
      }, { status: 500 })
    }

    // Track share in metadata (optional - for analytics)
    const metadata = vaultItem.metadata || {}
    const sharedEmails = metadata.shared_emails || []
    
    if (!sharedEmails.includes(recipient_email)) {
      sharedEmails.push(recipient_email)
      
      await supabase
        .from('vault_items')
        .update({
          metadata: {
            ...metadata,
            shared_emails: sharedEmails
          }
        })
        .eq('id', vault_item_id)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Legacy note shared successfully' 
    })

  } catch (error) {
    console.error('Error sharing legacy note:', error)
    return NextResponse.json(
      { error: 'Failed to share legacy note' },
      { status: 500 }
    )
  }
}

function createShareEmailTemplate({
  senderName,
  letterTitle,
  letterContent,
  attachmentLinks,
  siteUrl
}: {
  senderName: string
  letterTitle: string
  letterContent: string
  attachmentLinks: Array<{ url: string; type: string }>
  siteUrl: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            color: #1f2937;
          }
          .attachments {
            margin: 20px 0;
            padding: 20px;
            background: #f0f9ff;
            border-radius: 8px;
            border: 1px solid #bfdbfe;
          }
          .attachments h3 {
            margin-top: 0;
            color: #1f2937;
            font-size: 18px;
          }
          .attachments ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
          }
          .attachments li {
            margin: 8px 0;
          }
          .attachments a {
            color: #2563eb;
            text-decoration: none;
          }
          .attachments a:hover {
            text-decoration: underline;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .cta-button:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">For One Day</div>
            <h1 class="title">${senderName} shared a legacy note with you</h1>
            <p class="subtitle">A personal message from someone who cares about you</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 22px;">${letterTitle}</h2>
          
          <div class="content">
${letterContent}
          </div>

          ${attachmentLinks.length > 0 ? `
            <div class="attachments">
              <h3>Attachments</h3>
              <p style="color: #4b5563; font-size: 14px; margin-bottom: 10px;">
                This letter includes ${attachmentLinks.length} attachment(s). Click the links below to view:
              </p>
              <ul>
                ${attachmentLinks.map((link, i) => 
                  `<li><a href="${link.url}">View ${link.type === 'video' ? 'Video' : link.type === 'image' ? 'Image' : 'Attachment'} ${i + 1}</a></li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="footer">
            <p style="margin-bottom: 10px;">This message was sent through <strong>For One Day</strong>.</p>
            <p style="margin-bottom: 20px;">Want to create your own legacy letters for the people you love?</p>
            <a href="${siteUrl}" class="cta-button">Sign up for For One Day</a>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              Live today. Prepare for the day that matters most.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

