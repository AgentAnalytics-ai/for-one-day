import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionHistoryClient } from '@/components/reflection/reflection-history-client'
import { Calendar } from 'lucide-react'

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              Reflection History
            </h1>
            <p className="text-gray-600">
              {reflections?.length || 0} reflection{reflections?.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </div>

      {/* Client Component for Interactive Calendar */}
      <ReflectionHistoryClient 
        initialReflections={reflections || []} 
        userId={user.id}
      />
    </div>
  )
}

