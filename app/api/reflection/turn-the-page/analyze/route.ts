import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTurnThePagePhoto } from '@/lib/ai'
import { getTodaysVerse } from '@/lib/daily-verses'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'

/**
 * 📖 Turn the Page Challenge - AI Analysis API
 * Analyzes Bible photos and generates insights connecting verse + photo + reflection
 * Called asynchronously after reflection save (non-blocking)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is Pro (AI insights are Pro-only)
    const subscription = await getUserSubscriptionStatus(user.id)
    const isPro = subscription.plan === 'pro' || subscription.plan === 'lifetime'
    
    if (!isPro) {
      return NextResponse.json({ 
        error: 'AI insights are available for Pro users only. Upgrade to Pro to unlock this feature.',
        upgradeRequired: true
      }, { status: 403 })
    }

    const { reflectionId, imageUrl, reflection } = await request.json()

    if (!reflectionId || !imageUrl || !reflection) {
      return NextResponse.json({ 
        error: 'Missing required fields: reflectionId, imageUrl, reflection' 
      }, { status: 400 })
    }

    // Get today's verse for context
    const dailyVerse = getTodaysVerse()

    // Analyze the photo using AI
    const analysis = await analyzeTurnThePagePhoto({
      imageUrl,
      verse: {
        ref: dailyVerse.reference,
        text: dailyVerse.text
      },
      reflection: reflection
    })

    if (!analysis) {
      return NextResponse.json({ 
        error: 'Failed to analyze photo',
        success: false
      }, { status: 500 })
    }

    // Store insights in database
    const { error: updateError } = await supabase
      .from('daily_reflections')
      .update({
        turn_the_page_insights: analysis
      })
      .eq('id', reflectionId)
      .eq('user_id', user.id) // Security: ensure user owns this reflection

    if (updateError) {
      console.error('Error saving insights:', updateError)
      return NextResponse.json({ 
        error: 'Failed to save insights',
        success: false
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Photo analyzed successfully',
      insights: analysis
    })

  } catch (error) {
    console.error('Error in Turn the Page Challenge analysis API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false
      },
      { status: 500 }
    )
  }
}
