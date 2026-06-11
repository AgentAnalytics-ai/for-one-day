import { createClient } from '@/lib/supabase/server'
import { TodayGlanceHub } from '@/components/dashboard/today-glance-hub'
import { getCachedHouseholdSettings } from '@/app/actions/household-actions'
import { getCachedTodayListGlance } from '@/app/actions/list-actions'
import { getCachedTodayScheduleGlance } from '@/app/actions/calendar-actions'
import { getCachedTonightMealGlance } from '@/app/actions/meal-actions'
import { FirstKeepsakeCelebration } from '@/components/dashboard/first-keepsake-celebration'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [householdResult, listGlance, mealGlance, scheduleGlance] = await Promise.all([
    getCachedHouseholdSettings(),
    getCachedTodayListGlance(),
    getCachedTonightMealGlance(),
    getCachedTodayScheduleGlance(),
  ])
  const household = householdResult.success ? householdResult.household : null

  return (
    <>
      <FirstKeepsakeCelebration />
      <TodayGlanceHub
        householdName={household?.name ?? null}
        listGlance={listGlance}
        mealGlance={mealGlance}
        scheduleGlance={scheduleGlance}
      />
    </>
  )
}
