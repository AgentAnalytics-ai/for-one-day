import type { HouseholdScheduleEvent } from '@/lib/calendar-merge'

type ScheduleEventRowProps = {
  event: HouseholdScheduleEvent
  variant?: 'compact' | 'agenda'
}

export function ScheduleEventRow({ event, variant = 'compact' }: ScheduleEventRowProps) {
  const inner = (
    <>
      <span
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: event.displayColor }}
        aria-hidden
      />
      <span
        className={`shrink-0 font-mono font-semibold text-primary-900 ${
          variant === 'agenda' ? 'w-14 text-xs sm:text-sm' : 'text-sm'
        }`}
      >
        {event.timeLabel}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-primary-900 ${
            variant === 'agenda' ? 'text-sm font-medium leading-snug' : 'text-sm text-[#5C6478]'
          }`}
        >
          {event.title}
        </span>
        <span className="mt-0.5 block text-xs text-[#5C6478]/75">{event.memberName}</span>
        {event.location && variant === 'agenda' ? (
          <span className="mt-0.5 block truncate text-xs text-[#5C6478]/60">{event.location}</span>
        ) : null}
      </span>
    </>
  )

  const className =
    'relative flex items-start gap-3 rounded-xl border border-[#E7E2DA]/80 bg-white/90 py-2.5 pl-4 pr-3 transition-colors hover:border-[#D4CFC6] hover:bg-[#FAF7F2]'

  if (event.htmlLink) {
    return (
      <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }

  return <div className={className}>{inner}</div>
}
