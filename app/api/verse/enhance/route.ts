import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhanceVerse, getEnhancedVerse } from '@/lib/verse-enhancer'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'
import { openai } from '@/lib/ai'

/**
 * API route to enhance a verse with AI-powered explanations and prompts
 * Pro feature - requires Pro subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference, text, theme } = await request.json()

    if (!reference || !text || !theme) {
      return NextResponse.json({ 
        error: 'Verse reference, text, and theme are required' 
      }, { status: 400 })
    }

    // Check if user has Pro subscription
    const subscription = await getUserSubscriptionStatus(user.id)
    const isPro = subscription.plan === 'pro' || subscription.plan === 'lifetime'

    if (!isPro) {
      return NextResponse.json({ 
        error: 'Enhanced verses are available for Pro users only',
        upgradeRequired: true
      }, { status: 403 })
    }

    // Check cache first (store in database table)
    // Gracefully handle if table doesn't exist yet
    let cached = null
    try {
      const { data } = await supabase
        .from('enhanced_verses')
        .select('*')
        .eq('reference', reference)
        .single()
      cached = data
    } catch (error) {
      // Table might not exist yet - that's okay, we'll generate fresh
      console.log('Cache check note (table may not exist):', error)
    }

    if (cached && cached.enhancement) {
      return NextResponse.json({
        success: true,
        enhanced: cached.enhancement,
        cached: true
      })
    }

    // Check OpenAI configuration first
    if (!openai) {
      console.error('OpenAI API key not configured in Vercel environment variables')
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'OPENAI_API_KEY environment variable is missing in Vercel. Please add it in Settings → Environment Variables.'
      }, { status: 500 })
    }

    // Generate enhanced verse
    try {
      const enhanced = await getEnhancedVerse({ reference, text, theme }, isPro)

      if (!enhanced) {
        // If OpenAI is configured but still failed, it's an AI generation error
        console.error('Failed to generate enhanced verse (OpenAI configured but returned null)')
        return NextResponse.json({ 
          error: 'Failed to generate enhanced verse',
          details: 'AI generation returned null. Check Vercel function logs for OpenAI API errors.'
        }, { status: 500 })
      }

      // Cache the result (gracefully handle if table doesn't exist)
      try {
        await supabase
          .from('enhanced_verses')
          .insert({
            reference,
            enhancement: enhanced,
            created_at: new Date().toISOString()
          })
      } catch (error) {
        // Table might not exist yet or duplicate key - that's okay
        console.log('Cache insert note (table may not exist or duplicate):', error)
      }

      return NextResponse.json({
        success: true,
        enhanced,
        cached: false
      })
    } catch (enhanceError) {
      console.error('Error in getEnhancedVerse:', enhanceError)
      return NextResponse.json({ 
        error: 'Failed to enhance verse',
        details: enhanceError instanceof Error ? enhanceError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in verse enhancement API:', error)
    return NextResponse.json(
      { error: 'Failed to enhance verse' },
      { status: 500 }
    )
  }
}

