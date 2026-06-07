import { createClient } from '@/lib/supabase/server'
import { TodayGlanceHub } from '@/components/dashboard/today-glance-hub'
import { getCachedHouseholdSettings } from '@/app/actions/household-actions'
import { FirstKeepsakeCelebration } from '@/components/dashboard/first-keepsake-celebration'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const householdResult = await getCachedHouseholdSettings()
  const household = householdResult.success ? householdResult.household : null

  return (
    <>
      <FirstKeepsakeCelebration />
      <TodayGlanceHub householdName={household?.name ?? null} />
    </>
  )
}
