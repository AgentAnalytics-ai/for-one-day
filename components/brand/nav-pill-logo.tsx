import { SunMotif } from '@/components/brand/sun-motif'

/**
 * Desktop header lockup: sun mark above a clean white wordmark pill.
 */
import { cn } from '@/lib/utils'

type NavPillLogoVariant = 'premium-calm' | 'bold-brand'
type NavPillLogoSize = 'nav' | 'hero' | 'compact'

interface NavPillLogoProps {
  variant?: NavPillLogoVariant
  size?: NavPillLogoSize
  className?: string
}

const SIZE_STYLES: Record<
  NavPillLogoSize,
  { gap: string; sun: string; pill: string; text: string }
> = {
  nav: {
    gap: 'gap-1.5 sm:gap-2',
    sun: 'h-7 w-auto sm:h-8',
    pill: 'px-6 sm:px-7 py-1.5 sm:py-2',
    text: 'text-base sm:text-lg font-light',
  },
  hero: {
    gap: 'gap-2 sm:gap-2.5',
    sun: 'h-8 w-auto sm:h-10',
    pill: 'px-7 sm:px-8 py-2 sm:py-2.5',
    text: 'text-lg sm:text-xl font-medium',
  },
  compact: {
    gap: 'gap-1',
    sun: 'h-5 w-auto',
    pill: 'px-3.5 py-1',
    text: 'text-xs font-light',
  },
}

export function NavPillLogo({
  variant = 'premium-calm',
  size = 'nav',
  className,
}: NavPillLogoProps) {
  const isBold = variant === 'bold-brand'
  const resolvedSize = isBold && size === 'nav' ? 'hero' : size
  const s = SIZE_STYLES[resolvedSize]

  return (
    <div
      className={cn(
        'nav-pill-logo inline-flex flex-col items-center transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5',
        s.gap,
        className
      )}
    >
      <SunMotif animated className={s.sun} aria-hidden />
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-[#E7E2DA] bg-white shadow-sm transition-shadow duration-200 group-hover:shadow',
          s.pill
        )}
      >
        <span className={cn('font-serif tracking-[-0.01em] text-primary-950', s.text)}>
          For One Day
        </span>
      </div>
    </div>
  )
}
