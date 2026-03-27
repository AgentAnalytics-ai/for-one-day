import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionHistoryClient } from '@/components/reflection/reflection-history-client'
import { Calendar } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

/**
 * 📖 Reflection History Page - Instagram Archive Style
 * Calendar grid view of all past reflections
 * Meta-level polish with smooth interactions
 */
export default async function ReflectionHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get all reflections (we'll paginate on the client)
  const { data: reflections, error } = await supabase
    .from('daily_reflections')
    .select('date, reflection, media_urls')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching reflections:', error)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        className="mb-8"
        eyebrow={
          <>
            <Calendar className="w-4 h-4 text-purple-700" />
            <span className="text-purple-900">Archive</span>
          </>
        }
        title="Reflection History"
        subtitle={`${reflections?.length || 0} reflection${reflections?.length !== 1 ? 's' : ''} saved`}
      />

      {/* Client Component for Interactive Calendar */}
      <ReflectionHistoryClient 
        initialReflections={reflections || []} 
        userId={user.id}
      />
    </div>
  )
}

