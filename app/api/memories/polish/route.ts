import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'
import { polishMemoryText, type MemoryPolishMode } from '@/lib/memory-ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const text = typeof body.text === 'string' ? body.text : ''
    const mode = body.mode as MemoryPolishMode
    const personName = typeof body.personName === 'string' ? body.personName : undefined

    if (!text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }
    if (mode !== 'grammar' && mode !== 'expand') {
      return NextResponse.json({ error: 'mode must be grammar or expand' }, { status: 400 })
    }

    const sub = await getUserSubscriptionStatus(user.id)
    const pro = sub.plan === 'pro' || sub.plan === 'lifetime'
    if (!pro) {
      return NextResponse.json(
        { error: 'AI writing tools are a Pro feature. Upgrade to unlock grammar and expand.', code: 'PRO_REQUIRED' },
        { status: 403 }
      )
    }

    const polished = await polishMemoryText({ text, mode, personName })
    if (!polished) {
      return NextResponse.json(
        { error: 'AI is unavailable. Check OPENAI_API_KEY or try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true, text: polished })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
