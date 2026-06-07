import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const code = typeof body?.code === 'string' ? body.code.trim() : ''
    if (!code) {
      return NextResponse.json({ error: 'Please enter a referral code.' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('redeem_referral_code', {
      p_code_input: code,
    })

    if (error) {
      console.error('Referral redeem RPC error:', error)
      return NextResponse.json({ error: 'Unable to redeem code right now.' }, { status: 500 })
    }

    const result = Array.isArray(data) ? data[0] : data
    if (!result?.success) {
      return NextResponse.json(
        { error: result?.message || 'Invalid or expired referral code.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      accessEndsAt: result.access_ends_at,
      monthsGranted: result.months_granted,
      grantType: result.grant_type,
    })
  } catch (error) {
    console.error('Referral redeem API error:', error)
    return NextResponse.json(
      { error: 'Unable to redeem code right now.' },
      { status: 500 }
    )
  }
}

