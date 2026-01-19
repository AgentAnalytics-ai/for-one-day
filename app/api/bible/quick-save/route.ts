import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTodaysBibleReading } from '@/lib/bible-reading-plan'

/**
 * 📖 Quick Bible Photo Save API
 * Photo-first, minimal friction - saves Bible reading entry
 * Reflection text is optional (can be just photo + quick note)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const photoPath = formData.get('photo_path') as string
    const quickNote = formData.get('quick_note') as string || ''
    const reflection = formData.get('reflection') as string || quickNote || 'Bible reading entry'

    if (!photoPath) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    const todayReading = getTodaysBibleReading()

    // Upsert the reflection with Bible reading data
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert({
        user_id: user.id,
        date: today,
        reflection: reflection.trim(),
        media_urls: [photoPath],
        bible_book: todayReading.book,
        bible_chapter: todayReading.chapter,
        day_number: todayReading.dayNumber,
        quick_note: quickNote.trim() || null
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving Bible reading:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to save Bible reading',
        errorDetails: error
      }, { status: 500 })
    }

    // Update user stats
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

    // Trigger AI analysis in background (non-blocking)
    if (photoPath) {
      const { data: signedUrlData } = await supabase.storage
        .from('media')
        .createSignedUrl(photoPath, 3600)

      if (signedUrlData?.signedUrl) {
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const host = request.headers.get('host') || 'localhost:3000'
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
        
        fetch(`${baseUrl}/api/reflection/turn-the-page/analyze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            reflectionId: data.id,
            imageUrl: signedUrlData.signedUrl,
            reflection: reflection.trim()
          })
        }).catch(error => {
          console.error('Failed to trigger AI analysis:', error)
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bible reading saved successfully',
      reflection: data
    })

  } catch (error) {
    console.error('Error in quick save API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
