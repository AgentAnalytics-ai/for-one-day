import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 📅 Weekly Reflections API
 * Returns reflections from the last 7 days
 * Includes signed URLs for images
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
    const userIdParam = searchParams.get('userId')

    // Ensure user can only access their own data
    const userId = userIdParam === user.id ? userIdParam : user.id

    // Calculate date range (last 7 days including today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // 7 days total including today

    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    // Get reflections from last 7 days
    const { data: reflections, error: reflectionsError } = await supabase
      .from('daily_reflections')
      .select('date, reflection, media_urls')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgoStr)
      .lte('date', todayStr)
      .order('date', { ascending: false })

    if (reflectionsError) {
      console.error('Error fetching weekly reflections:', reflectionsError)
      return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 })
    }

    // Generate signed URLs for all images
    const signedUrls: Record<string, string[]> = {}
    
    if (reflections && reflections.length > 0) {
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
    }

    return NextResponse.json({
      success: true,
      reflections: reflections || [],
      signedUrls
    })

  } catch (error) {
    console.error('Error in weekly reflections API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

