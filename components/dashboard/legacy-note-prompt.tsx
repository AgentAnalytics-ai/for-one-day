import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PremiumButton } from '@/components/ui/premium-button'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'

interface LegacyNotePromptProps {
  userId: string
}

export async function LegacyNotePrompt({ userId }: LegacyNotePromptProps) {
  const supabase = await createClient()

  // Get reflection count
  const { data: reflections } = await supabase
    .from('daily_reflections')
    .select('id')
    .eq('user_id', userId)

  const reflectionCount = reflections?.length || 0

  // Get legacy note count
  const { data: legacyNotes } = await supabase
    .from('vault_items')
    .select('id')
    .eq('owner_id', userId)

  const legacyCount = legacyNotes?.length || 0

  // Only show if user has reflections but no legacy notes, or at milestones
  const milestones = [10, 25, 50, 100, 200]
  const isMilestone = milestones.includes(reflectionCount)
  const shouldShow = (reflectionCount > 0 && legacyCount === 0) || isMilestone

  if (!shouldShow) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 rounded-2xl p-6 md:p-8 border-2 border-primary-200 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
            {legacyCount === 0 
              ? "Your Wisdom Deserves to Be Preserved"
              : isMilestone
              ? `You've written ${reflectionCount} reflections!`
              : "Preserve Your Legacy"
            }
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            {legacyCount === 0
              ? `You've written ${reflectionCount} reflection${reflectionCount !== 1 ? 's' : ''}. Your daily practice builds wisdom that deserves to be preserved for future generations. Create your first legacy note today.`
              : `You've reached a milestone! Consider preserving your most meaningful reflections as legacy notes for your loved ones.`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/vault">
              <PremiumButton size="lg" className="w-full sm:w-auto">
                <Lock className="w-4 h-4 mr-2" />
                {legacyCount === 0 ? 'Create Your First Legacy Note' : 'Create Legacy Note'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </PremiumButton>
            </Link>
            {reflectionCount > 0 && (
              <Link href="/reflection">
                <PremiumButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Reflections
                </PremiumButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
