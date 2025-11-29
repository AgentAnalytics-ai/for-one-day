import { createClient } from '@/lib/supabase/server'
import { EnhancedStreak } from './enhanced-streak'

interface DynamicStatsProps {
  userId: string
}

export async function DynamicStats({ userId }: DynamicStatsProps) {
  const supabase = await createClient()

  // Get total reflections
  const { data: reflections } = await supabase
    .from('daily_reflections')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  // Get total legacy notes
  const { data: legacyNotes } = await supabase
    .from('vault_items')
    .select('id')
    .eq('owner_id', userId)

  // Calculate reflection streak (simple count for stats card)
  let reflectionStreak = 0
  if (reflections && reflections.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < reflections.length; i++) {
      const reflectionDate = new Date(reflections[i].date)
      reflectionDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - reflectionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === i) {
        reflectionStreak++
      } else {
        break
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Streak Display - Full Width */}
      <EnhancedStreak userId={userId} />
      
      {/* Other Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SacredStatCard
          title="Reflections Logged"
          value={`${(reflections?.length || 0)} entries`}
          description="All time"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 6h8M8 10h8M8 14h8M4 6h.01M4 10h.01M4 14h.01" />
            </svg>
          }
        />
        
        <SacredStatCard
          title="For One Day Items"
          value={`${legacyNotes?.length || 0} stored`}
          description={legacyNotes && legacyNotes.length > 0 ? 'Legacy preserved!' : 'Start your legacy today!'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

function SacredStatCard({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <div className="text-gray-600">
            {icon}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <h4 className="text-lg font-serif font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
