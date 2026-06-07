import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiSecret } from '@/lib/route-guards'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { findUserIdByEmail } from '@/lib/auth-admin'

type FounderReferralAction = 'grant' | 'revoke'

function addMonths(base: Date, months: number): Date {
  const next = new Date(base)
  next.setMonth(next.getMonth() + months)
  return next
}

export async function POST(request: NextRequest) {
  const denied = requireAdminApiSecret(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const action: FounderReferralAction = body?.action === 'revoke' ? 'revoke' : 'grant'
    const months = Number.isFinite(body?.months) ? Math.max(1, Math.min(24, Number(body.months))) : 3
    const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : null

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server misconfigured (service role)' }, { status: 503 })
    }

    const userId = await findUserIdByEmail(email)
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'revoke') {
      const { error: revokeError } = await supabase
        .from('referral_entitlements')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('grant_type', 'founder_referral')
        .eq('status', 'active')

      if (revokeError) {
        return NextResponse.json({ error: revokeError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: 'revoke',
        userId,
        email,
      })
    }

    const now = new Date()
    const nowIso = now.toISOString()

    const { data: existingGrant } = await supabase
      .from('referral_entitlements')
      .select('id, ends_at')
      .eq('user_id', userId)
      .eq('grant_type', 'founder_referral')
      .eq('status', 'active')
      .gt('ends_at', nowIso)
      .order('ends_at', { ascending: false })
      .limit(1)
      .single()

    const startBase = existingGrant?.ends_at ? new Date(existingGrant.ends_at) : now
    const nextEndsAt = addMonths(startBase, months).toISOString()

    if (existingGrant?.id) {
      const { error: extendError } = await supabase
        .from('referral_entitlements')
        .update({
          ends_at: nextEndsAt,
          updated_at: nowIso,
          metadata: {
            source: 'founder_referral',
            reason,
            extended_by_months: months,
          },
        })
        .eq('id', existingGrant.id)

      if (extendError) {
        return NextResponse.json({ error: extendError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: 'grant',
        mode: 'extended',
        userId,
        email,
        startsAt: nowIso,
        endsAt: nextEndsAt,
        months,
      })
    }

    const { error: insertError } = await supabase
      .from('referral_entitlements')
      .insert({
        user_id: userId,
        grant_type: 'founder_referral',
        source: 'founder',
        status: 'active',
        starts_at: nowIso,
        ends_at: nextEndsAt,
        metadata: {
          source: 'founder_referral',
          reason,
          months,
        },
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'grant',
      mode: 'created',
      userId,
      email,
      startsAt: nowIso,
      endsAt: nextEndsAt,
      months,
    })
  } catch (error) {
    console.error('Founder referral admin API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

