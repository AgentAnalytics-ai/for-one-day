import type { ReactNode } from 'react'

type MarkProps = {
  className?: string
  title?: string
}

function MarkTile({
  children,
  className = '',
  title,
}: {
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect x="2.25" y="2.25" width="19.5" height="19.5" rx="6" fill="#102A43" />
      {children}
    </svg>
  )
}

// A) Refined 1 + moment dot (best baseline)
export function MarkOneDot({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="17.15" cy="6.85" r="1.65" fill="#D97706" />
      <path
        d="M12.1 6.9c.5 0 .9.4.9.9v9.3c0 .5-.4.9-.9.9h-1c-.5 0-.9-.4-.9-.9V9.7l-1.25.8c-.4.25-.95.12-1.2-.3l-.38-.63c-.25-.42-.11-.97.3-1.23l2.62-1.7c.15-.1.32-.15.5-.15h1.32z"
        fill="#ffffff"
      />
    </MarkTile>
  )
}

// A2) One-dot micro-variants (optical tweaks for 16px clarity)
export function MarkOneDotOpticalA({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="17.0" cy="7.15" r="1.6" fill="#D97706" />
      <path
        d="M12.2 6.85c.55 0 1 .45 1 1v9.1c0 .55-.45 1-1 1h-1.05c-.55 0-1-.45-1-1V9.9l-1.15.74c-.45.29-1.05.15-1.33-.32l-.34-.56c-.28-.47-.13-1.07.33-1.36l2.62-1.7c.18-.12.38-.18.6-.18h1.32z"
        fill="#ffffff"
      />
    </MarkTile>
  )
}

export function MarkOneDotOpticalB({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="17.35" cy="6.95" r="1.55" fill="#D97706" />
      <path
        d="M11.95 6.9c.5 0 .9.4.9.9v9.25c0 .5-.4.9-.9.9H11c-.5 0-.9-.4-.9-.9V10l-1.2.78c-.42.27-.98.14-1.24-.28l-.34-.56c-.26-.42-.13-.98.28-1.25l2.6-1.7c.16-.1.34-.15.53-.15h1.22z"
        fill="#ffffff"
      />
      <path d="M9.15 17.65h5.8" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" strokeLinecap="round" />
    </MarkTile>
  )
}

export function MarkOneDotOpticalC({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="17.1" cy="7.0" r="1.6" fill="#D97706" />
      <path
        d="M12.05 6.75c.6 0 1.08.48 1.08 1.08v9.02c0 .6-.48 1.08-1.08 1.08h-1.05c-.6 0-1.08-.48-1.08-1.08V9.95l-1.1.7c-.5.32-1.16.17-1.47-.35l-.28-.47c-.31-.52-.14-1.19.37-1.52l2.58-1.68c.2-.13.44-.2.68-.2h1.35z"
        fill="#ffffff"
      />
    </MarkTile>
  )
}

export function MarkOneDotOpticalD({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="16.95" cy="7.05" r="1.55" fill="#D97706" />
      <path
        d="M11.9 6.85c.55 0 1 .45 1 1v9.2c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1V9.8l-1.05.67c-.55.35-1.27.18-1.62-.37l-.22-.35c-.35-.55-.19-1.27.35-1.62l2.56-1.66c.22-.14.47-.22.73-.22h1.27z"
        fill="#ffffff"
      />
      <circle cx="14.9" cy="16.85" r="0.8" fill="#ffffff" fillOpacity="0.25" />
    </MarkTile>
  )
}

// B) Horizon + dot (poetic)
export function MarkHorizonDot({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="12" cy="9.4" r="1.7" fill="#D97706" />
      <path d="M7 14.5h10" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.8 16.9h8.4" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </MarkTile>
  )
}

// B2) Horizon family (optical alternatives)
export function MarkHorizonDotA({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      {/* Calmer sunrise: centered sun just above horizon, soft halo */}
      <circle cx="12" cy="10.3" r="1.8" fill="#D97706" />
      <path
        d="M9 8.4c.9-1 2-1.5 3-1.5s2.1.5 3 1.5"
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path d="M6.8 13.1h10.4" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.1 15.2h7.8" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    </MarkTile>
  )
}

export function MarkHorizonDotB({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="12.3" cy="9.2" r="1.55" fill="#D97706" />
      <path d="M6.6 14.3h10.8" stroke="#ffffff" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M7.2 16.6h9.6" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.1" strokeLinecap="round" />
    </MarkTile>
  )
}

export function MarkHorizonDotC({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="11.9" cy="9.0" r="1.6" fill="#D97706" />
      <path d="M6.8 14.4h10.4" stroke="#ffffff" strokeWidth="1.65" strokeLinecap="round" />
      <path d="M9.2 16.6h5.6" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7.4 16.9h9.2" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="0.9" strokeLinecap="round" />
    </MarkTile>
  )
}

// C) Bookmark corner + dot (editorial)
export function MarkBookmarkDot({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <path
        d="M9.1 6.8c0-.6.5-1.1 1.1-1.1h3.7c.6 0 1.1.5 1.1 1.1v11.1l-3.0-1.7-3.0 1.7V6.8z"
        fill="#ffffff"
        fillOpacity="0.92"
      />
      <circle cx="16.9" cy="7.0" r="1.5" fill="#D97706" />
    </MarkTile>
  )
}

// D) Monogram F•1 (brandy)
export function MarkMonogram({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      <circle cx="12" cy="12" r="5.8" fill="#ffffff" fillOpacity="0.12" />
      <path
        d="M9 8.2h6.4c.55 0 1 .45 1 1v.7c0 .55-.45 1-1 1H11v1.5h3.8c.55 0 1 .45 1 1v.6c0 .55-.45 1-1 1H11v2.9c0 .55-.45 1-1 1h-.95c-.55 0-1-.45-1-1V9.2c0-.55.45-1 1-1z"
        fill="#ffffff"
      />
      <circle cx="16.9" cy="7.0" r="1.5" fill="#D97706" />
      <path
        d="M14.25 15.1c.4 0 .72.32.72.72v2.55c0 .4-.32.72-.72.72h-.72c-.4 0-.72-.32-.72-.72v-1.56l-.82.52c-.32.2-.74.1-.94-.22l-.28-.46c-.2-.32-.1-.74.22-.94l1.72-1.12c.12-.08.25-.12.39-.12h1.15z"
        fill="#ffffff"
        fillOpacity="0.95"
      />
    </MarkTile>
  )
}

// E) Letter handoff (symbolic, not illustrative)
export function MarkLetterHandoff({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      {/* Moment dot */}
      <circle cx="16.9" cy="7.1" r="1.55" fill="#D97706" />

      {/* Envelope */}
      <rect x="8.1" y="10.0" width="7.8" height="5.3" rx="1.2" fill="#ffffff" fillOpacity="0.92" />
      <path d="M8.55 10.55l3.45 2.55c.35.26.83.26 1.18 0l3.45-2.55" stroke="#102A43" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />

      {/* Left + right hands (two minimal curves) */}
      <path
        d="M6.6 13.3c.9-1.05 1.9-1.55 3.1-1.55h.9"
        stroke="#ffffff"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M17.4 12.0h.8c1.2 0 2.2.5 3.2 1.6"
        stroke="#ffffff"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </MarkTile>
  )
}

export function MarkLetterHandoffA({ className = '', title = 'For One Day' }: MarkProps) {
  return (
    <MarkTile className={className} title={title}>
      {/* Dot reads as “moment” / “seal” */}
      <circle cx="17.05" cy="7.0" r="1.5" fill="#D97706" />

      {/* Hands as opposing arcs */}
      <path d="M6.7 14.1c1.3-1.7 2.7-2.4 4.5-2.4h.35" stroke="#ffffff" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M17.95 11.7h.35c1.85 0 3.25.7 4.55 2.4" stroke="#ffffff" strokeWidth="1.55" strokeLinecap="round" />

      {/* Envelope as a crisp diamond + base */}
      <path d="M8.2 14.9h7.6" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.1" strokeLinecap="round" />
      <path
        d="M8.4 10.6h7.2c.55 0 1 .45 1 1v3.0c0 .55-.45 1-1 1H8.4c-.55 0-1-.45-1-1v-3.0c0-.55.45-1 1-1z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
      <path d="M7.9 11.2l4.1 2.8c.15.1.35.1.5 0l4.1-2.8" stroke="#102A43" strokeOpacity="0.7" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
    </MarkTile>
  )
}

export const LOGO_VARIANTS = [
  { id: 'horizon-a', name: 'Horizon sunrise (A)', Mark: MarkHorizonDotA },
  { id: 'horizon-b', name: 'Horizon line (B)', Mark: MarkHorizonDotB },
  { id: 'handoff-a', name: 'Letter handoff (A)', Mark: MarkLetterHandoffA },
] as const

