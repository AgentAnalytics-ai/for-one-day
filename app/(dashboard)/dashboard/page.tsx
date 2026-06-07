import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { LegacyNotePrompt } from '@/components/dashboard/legacy-note-prompt'
import { MemoryCaptureCard } from '@/components/memories/memory-capture-card'
import { RecentMemoriesStrip } from '@/components/memories/recent-memories-strip'
import { getDailyCapturePrompt } from '@/lib/daily-capture-prompts'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { getCachedHouseholdSettings } from '@/app/actions/household-actions'
import { FirstKeepsakeCelebration } from '@/components/dashboard/first-keepsake-celebration'

export default async function DashboardPage() {
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
  const effectivePlan = household?.plan ?? profile?.plan ?? 'free'

  const suggestion = getDailyCapturePrompt()
  const isPro = effectivePlan === 'pro' || effectivePlan === 'lifetime'

  return (
    <div className="space-y-8 md:space-y-10">
      <ScrollReveal>
        <header className="flex flex-col items-center gap-3 pt-1 text-center md:gap-3.5 md:pt-2">
          {household ? (
            <p className="text-[11px] font-medium text-slate-500">
              <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">
                At home
              </span>
              {' · '}
              <span className="text-slate-600">{household.name}</span>
            </p>
          ) : null}
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Today
          </span>
          <TimeGreeting />
        </header>
      </ScrollReveal>

      <FirstKeepsakeCelebration />

      <ScrollReveal delay={100}>
        <MemoryCaptureCard isPro={isPro} dailySuggestion={suggestion} />
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-label">Recent</h2>
            <Link
              href="/memories"
              className="text-sm font-medium text-primary-800 underline-offset-4 transition-colors hover:text-primary-950 hover:underline"
            >
              View all
            </Link>
          </div>
          <RecentMemoriesStrip />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <LegacyNotePrompt userId={user.id} />
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <section className="space-y-3">
          <h2 className="section-label">Your progress</h2>
          <DynamicStats userId={user.id} />
        </section>
      </ScrollReveal>
    </div>
  )
}
