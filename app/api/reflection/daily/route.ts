import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      reflection: {
        day: new Date().getDay(),
        date: today,
        question: "What are you most grateful for today?",
        completed: true,
        userReflection: existingReflection.reflection
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

    const { reflection } = await request.json()

    if (!reflection?.trim()) {
      return NextResponse.json({ error: 'Reflection is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert the reflection
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert({
        user_id: user.id,
        date: today,
        reflection: reflection.trim()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving reflection:', error)
      return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 })
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
