import type { SVGProps } from 'react'

/**
 * SunMotif
 * Standalone sunrise mark (no tile) for hero/headers/brand moments.
 * Tuned to feel calm and readable at small sizes.
 */
export function SunMotif(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" aria-hidden="true" {...props}>
      {/* Sun */}
      <circle cx="24" cy="16" r="5" fill="#D97706" />
      {/* Horizon */}
      <path d="M10 20.5h28" stroke="#102A43" strokeWidth="2.2" strokeLinecap="round" />
      {/* Reflection */}
      <path d="M14 24h20" stroke="#102A43" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

