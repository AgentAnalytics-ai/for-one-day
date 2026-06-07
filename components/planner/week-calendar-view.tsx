import Link from 'next/link'

type WeekDay = {
  key: string
  weekday: string
  dateNum: number
  isToday: boolean
  events: { time: string; label: string }[]
  meal: string | null
}

export function WeekCalendarView() {
  const days = buildWeekDays()
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-medium text-primary-900">{monthLabel}</h2>
        <span className="text-xs font-medium text-[#5C6478]">Family calendar · Step 7</span>
      </div>

      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x">
        {days.map((day) => (
          <div
            key={day.key}
            className={`min-w-[4.5rem] flex-shrink-0 snap-center rounded-xl px-3 py-2.5 text-center ${
              day.isToday
                ? 'bg-primary-900 text-white'
                : 'border border-[#E7E2DA] bg-white'
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase ${day.isToday ? 'text-white/75' : 'text-[#5C6478]'}`}>
              {day.weekday}
            </p>
            <p className={`font-serif text-lg font-medium ${day.isToday ? 'text-white' : 'text-primary-900'}`}>
              {day.dateNum}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <div key={`agenda-${day.key}`} className="surface-card p-4 sm:p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-base font-medium text-primary-900">
                {day.isToday ? 'Today' : day.weekday}
                <span className="ml-2 text-sm font-normal text-[#5C6478]">
                  {day.weekday}, {day.dateNum}
                </span>
              </h3>
              {day.meal ? (
                <span className="text-xs font-medium text-accent-700">Dinner: {day.meal}</span>
              ) : null}
            </div>

            {day.events.length > 0 ? (
              <ul className="space-y-2">
                {day.events.map((event) => (
                  <li
                    key={`${day.key}-${event.time}`}
                    className="flex items-start gap-3 rounded-xl bg-[#FAF7F2]/80 px-3 py-2.5"
                  >
                    <span className="shrink-0 font-mono text-sm font-semibold text-primary-900">
                      {event.time}
                    </span>
                    <span className="text-sm text-[#5C6478]">{event.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5C6478]/80">No events yet</p>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#5C6478]">
        Connect Google Calendar in{' '}
        <Link href="/settings#billing" className="font-medium text-primary-900 hover:underline">
          Plan
        </Link>{' '}
        to merge schedules for your home.
      </p>
    </div>
  )
}

function buildWeekDays(): WeekDay[] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())

  const sampleEvents: Record<number, { time: string; label: string }[]> = {
    0: [{ time: '6:30 PM', label: 'Family dinner' }],
    3: [{ time: '3:30 PM', label: 'Soccer practice' }],
    6: [{ time: '10:00 AM', label: 'Farmers market' }],
  }

  const sampleMeals: Record<number, string> = {
    0: 'Tacos',
    3: 'Pasta',
    5: 'Grill night',
  }

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dayIndex = d.getDay()
    return {
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      events: sampleEvents[dayIndex] ?? [],
      meal: sampleMeals[dayIndex] ?? null,
    }
  })
}
