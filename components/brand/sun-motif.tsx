import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

export interface SunMotifProps extends SVGProps<SVGSVGElement> {
  /** Gentle float + soft glow (honors prefers-reduced-motion). */
  animated?: boolean
}

/**
 * SunMotif — standalone sunrise mark (no tile) for hero / headers / brand moments.
 */
export function SunMotif({ animated = false, className, ...props }: SunMotifProps) {
  const svg = (
    <svg viewBox="0 0 48 32" aria-hidden="true" className={className} {...props}>
      <circle cx="24" cy="16" r="5" fill="#D97706" />
      <path d="M10 20.5h28" stroke="#102A43" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 24h20" stroke="#102A43" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )

  if (!animated) return svg

  return (
    <span className={cn('sun-motif--animate inline-flex shrink-0 will-change-transform')} aria-hidden>
      {svg}
    </span>
  )
}

