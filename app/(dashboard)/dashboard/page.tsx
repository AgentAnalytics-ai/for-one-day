import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { DynamicStats } from '@/components/dashboard/dynamic-stats'
import { TimeGreeting } from '@/components/dashboard/time-greeting'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { LegacyNotePrompt } from '@/components/dashboard/legacy-note-prompt'
import { MemoryCaptureCard } from '@/components/memories/memory-capture-card'
import { RecentMemoriesStrip } from '@/components/memories/recent-memories-strip'
import { getDailyCapturePrompt } from '@/lib/daily-capture-prompts'

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <ScrollReveal>
        <div className="text-center">
          <TimeGreeting />
          <SubscriptionBadge tier={profile?.plan || 'free'} />
          {(!profile || profile.plan === 'free') && (
            <div className="mt-4">
              <Link
                href="/upgrade"
                aria-label="Upgrade to Pro plan"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <MemoryCaptureCard isPro={isPro} dailySuggestion={suggestion} />
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <RecentMemoriesStrip />
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <LegacyNotePrompt userId={user.id} />
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <DynamicStats userId={user.id} />
      </ScrollReveal>
    </div>
  )
}
