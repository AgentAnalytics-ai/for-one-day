import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCachedHouseholdSettings } from '@/app/actions/household-actions'
import { MemoryCaptureCard } from '@/components/memories/memory-capture-card'
import { getDailyCapturePrompt } from '@/lib/daily-capture-prompts'

export default async function MoreCapturePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const householdResult = await getCachedHouseholdSettings()
  const household = householdResult.success ? householdResult.household : null
  const plan = household?.plan ?? profile?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'lifetime'

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <header>
        <Link
          href="/more"
          className="text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
        >
          ← More
        </Link>
        <h1 className="page-title mt-4">Save a memory</h1>
        <p className="page-subtitle mt-1">On your phone — not the kitchen wall.</p>
      </header>
      <MemoryCaptureCard isPro={isPro} dailySuggestion={getDailyCapturePrompt()} />
    </div>
  )
}
