import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get today's reflection if it exists
    const { data: existingReflection, error: reflectionError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (reflectionError && reflectionError.code !== 'PGRST116') {
      console.error('Error fetching reflection:', reflectionError)
      return NextResponse.json({ error: 'Failed to fetch reflection' }, { status: 500 })
    }

    // If no reflection exists, create a simple daily prompt
    if (!existingReflection) {
      const dailyPrompts = [
        "What are you most grateful for today?",
        "What challenge did you face today, and how did you grow from it?",
        "What moment brought you the most joy today?",
        "What did you learn about yourself today?",
        "How did you show love to someone today?",
        "What would you like to remember about today?",
        "What are you looking forward to tomorrow?"
      ]

      const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
      const promptIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Use Sunday prompt for Sunday, otherwise use day-1

      return NextResponse.json({
        success: true,
        reflection: {
          day: dayOfWeek,
          date: today,
          question: dailyPrompts[promptIndex],
          completed: false,
          userReflection: null
        }
      })
    }

    // Generate signed URLs for media attachments if they exist
    let mediaUrls: string[] = []
    if (existingReflection.media_urls && existingReflection.media_urls.length > 0) {
      const signedUrlPromises = existingReflection.media_urls.map(async (storagePath: string) => {
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
      reflection: {
        day: new Date().getDay(),
        date: today,
        question: "What are you most grateful for today?",
        completed: true,
        userReflection: existingReflection.reflection,
        mediaUrls: mediaUrls // Include signed URLs for images
      }
    })

  } catch (error) {
    console.error('Error in daily reflection API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reflection, media_urls } = await request.json()

    if (!reflection?.trim()) {
      return NextResponse.json({ error: 'Reflection is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert the reflection with optional media URLs
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert({
        user_id: user.id,
        date: today,
        reflection: reflection.trim(),
        media_urls: media_urls && Array.isArray(media_urls) ? media_urls : []
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving reflection:', error)
      // Provide more detailed error message
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database table missing. Please run the daily_reflections table migration in Supabase.',
          errorCode: 'TABLE_MISSING'
        }, { status: 500 })
      }
      if (error.code === '42703') {
        return NextResponse.json({ 
          error: 'Database column missing. Please run the media_urls column migration in Supabase.',
          errorCode: 'COLUMN_MISSING'
        }, { status: 500 })
      }
      return NextResponse.json({ 
        error: error.message || 'Failed to save reflection',
        errorDetails: error
      }, { status: 500 })
    }

    // Update user stats - increment total reflections
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('total_reflections')
      .eq('user_id', user.id)
      .single()

    const newTotal = (existingStats?.total_reflections || 0) + 1

    await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_reflections: newTotal,
        last_reflection_date: today
      }, {
        onConflict: 'user_id'
      })

    // Trigger AI analysis for Turn the Page Challenge (Pro users only, non-blocking, fire-and-forget)
    // Only analyze if user is Pro, has photos, and reflection text
    const subscription = await getUserSubscriptionStatus(user.id)
    const isPro = subscription.plan === 'pro' || subscription.plan === 'lifetime'
    
    if (isPro && data.media_urls && data.media_urls.length > 0 && reflection.trim()) {
      // Get first image URL for analysis
      const firstImagePath = data.media_urls[0]
      if (firstImagePath) {
        // Generate signed URL for AI analysis
        const { data: signedUrlData } = await supabase.storage
          .from('media')
          .createSignedUrl(firstImagePath, 3600) // 1 hour expiry

        if (signedUrlData?.signedUrl) {
          // Trigger analysis asynchronously (don't wait for response)
          // Construct base URL from request
          const protocol = request.headers.get('x-forwarded-proto') || 'http'
          const host = request.headers.get('host') || 'localhost:3000'
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
          
          // Fire-and-forget: trigger analysis without blocking
          fetch(`${baseUrl}/api/reflection/turn-the-page/analyze`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              // Forward auth cookie for internal API call
              'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
              reflectionId: data.id,
              imageUrl: signedUrlData.signedUrl,
              reflection: reflection.trim()
            })
          }).catch(error => {
            // Silently fail - analysis is optional, save should succeed regardless
            console.error('Failed to trigger AI analysis:', error)
          })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reflection saved successfully',
      reflection: data
    })

  } catch (error) {
    console.error('Error in save reflection API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
