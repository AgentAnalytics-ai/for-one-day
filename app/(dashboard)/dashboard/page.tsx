import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { LegacyNotePrompt } from '@/components/dashboard/legacy-note-prompt'
import { MemoryCaptureCard } from '@/components/memories/memory-capture-card'
import { RecentMemoriesStrip } from '@/components/memories/recent-memories-strip'
import { getDailyCapturePrompt } from '@/lib/daily-capture-prompts'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
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

  const suggestion = getDailyCapturePrompt()
  const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'

  return (
    <div className="space-y-8 md:space-y-10">
      <ScrollReveal>
        <header className="flex flex-col items-center gap-2 text-center pt-1 md:pt-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Today
          </span>
          <TimeGreeting />
          <SubscriptionBadge tier={profile?.plan || 'free'} />
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
            <Link href="/memories" className="text-sm text-blue-800 hover:underline">
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
