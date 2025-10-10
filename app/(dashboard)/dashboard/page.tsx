import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

/**
 * 📅 Dashboard - Today view
 * Shows today's devotion, events, and tasks
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's family
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Today
        </h1>
        <p className="text-gray-600 mt-1">{today}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Devotion Streak"
          value="0 days"
          icon="🔥"
          description="Keep going!"
        />
        <StatCard
          title="Table Talks"
          value="0 played"
          icon="🎮"
          description="This month"
        />
        <StatCard
          title="Vault Items"
          value="0 items"
          icon="🗂️"
          description="Stored safely"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Devotion */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-serif font-bold">Today's Devotion</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📖</p>
              <p className="text-lg mb-2">No devotion yet today</p>
              <p className="text-sm">Take 3 minutes to reflect and journal</p>
              <button className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Start Devotion
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-serif font-bold">Today's Tasks</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">✅</p>
              <p className="text-lg mb-2">No tasks scheduled</p>
              <p className="text-sm">Add your first task to get started</p>
              <button className="mt-6 border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 px-6 py-2 rounded-lg font-medium transition-colors">
                Add Task
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-serif font-bold">This Week's Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="flex-1 text-center"
              >
                <div className="text-xs text-gray-600 mb-2">{day}</div>
                <div className="h-12 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Complete 6 devotions to unlock Sunday's Table Talk
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: string
  icon: string
  description: string
}) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl shadow-sm overflow-hidden">
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>
}

