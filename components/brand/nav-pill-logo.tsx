import { SunMotif } from '@/components/brand/sun-motif'

/**
 * Desktop header lockup: sun mark above the navy wordmark pill (no icon inside the pill).
 */
type NavPillLogoVariant = 'premium-calm' | 'bold-brand'

interface NavPillLogoProps {
  variant?: NavPillLogoVariant
}

export function NavPillLogo({ variant = 'premium-calm' }: NavPillLogoProps) {
  const isBold = variant === 'bold-brand'

  return (
    <div className={`inline-flex flex-col items-center ${isBold ? 'gap-2 sm:gap-2.5' : 'gap-1.5 sm:gap-2'}`}>
      <SunMotif className={isBold ? 'h-8 w-auto sm:h-10' : 'h-7 w-auto sm:h-8'} aria-hidden />
      <div
        className={`inline-flex items-center justify-center rounded-full bg-[#102A43] shadow-sm ${
          isBold ? 'px-7 sm:px-8 py-2 sm:py-2.5' : 'px-6 sm:px-7 py-1.5 sm:py-2'
        }`}
      >
        <span
          className={`font-serif tracking-tight text-white ${
            isBold ? 'text-lg sm:text-xl font-medium' : 'text-base sm:text-lg font-light'
          }`}
        >
          For One Day
        </span>
      </div>
    </div>
  )
}
