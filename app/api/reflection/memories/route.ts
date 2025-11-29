import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 📅 Reflection Memories API
 * Returns reflections from "this time last year"
 * Free for all users (drives engagement)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const targetDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Calculate date from one year ago
    const dateObj = new Date(targetDate)
    dateObj.setFullYear(dateObj.getFullYear() - 1)
    const oneYearAgo = dateObj.toISOString().split('T')[0]

    // Get reflection from one year ago
    const { data: reflection, error: reflectionError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', oneYearAgo)
      .single()

    if (reflectionError && reflectionError.code !== 'PGRST116') {
      console.error('Error fetching memory:', reflectionError)
      return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
    }

    // If no reflection exists, return null (UI can show a friendly message)
    if (!reflection) {
      return NextResponse.json({
        success: true,
        exists: false,
        date: oneYearAgo,
        message: 'No reflection from this date last year'
      })
    }

    // Generate signed URLs for any media attachments
    let mediaUrls: string[] = []
    if (reflection.media_urls && reflection.media_urls.length > 0) {
      // Get signed URLs for media files
      const signedUrlPromises = reflection.media_urls.map(async (storagePath: string) => {
        const { data } = await supabase.storage
          .from('media')
          .createSignedUrl(storagePath, 3600) // 1 hour expiry
        return data?.signedUrl || null
      })
      
      const signedUrls = await Promise.all(signedUrlPromises)
      mediaUrls = signedUrls.filter((url): url is string => url !== null)
    }

    return NextResponse.json({
      success: true,
      exists: true,
      date: oneYearAgo,
      reflection: {
        ...reflection,
        media_urls: mediaUrls // Replace storage paths with signed URLs
      }
    })

  } catch (error) {
    console.error('Error in reflection memories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

