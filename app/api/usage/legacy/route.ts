import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkLegacyNoteLimit } from '@/lib/subscription-utils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = await checkLegacyNoteLimit(user.id)
  return NextResponse.json({ success: true, current: limit.current, limit: limit.limit })
}


