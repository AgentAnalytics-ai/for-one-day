import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 📸 Reflection History Media API
 * Generates signed URLs for reflection images
 * Used for calendar grid view
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reflections } = await request.json()

    if (!Array.isArray(reflections)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Generate signed URLs for all images
    const signedUrls: Record<string, string[]> = {}
    
    for (const reflection of reflections) {
      if (reflection.media_urls && reflection.media_urls.length > 0) {
        const urlPromises = reflection.media_urls.map(async (storagePath: string) => {
          const { data } = await supabase.storage
            .from('media')
            .createSignedUrl(storagePath, 3600) // 1 hour expiry
          return data?.signedUrl || null
        })
        
        const urls = await Promise.all(urlPromises)
        const validUrls = urls.filter((url): url is string => url !== null)
        
        if (validUrls.length > 0) {
          signedUrls[reflection.date] = validUrls
        }
      }
    }

    return NextResponse.json({
      success: true,
      signedUrls
    })

  } catch (error) {
    console.error('Error in history media API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

