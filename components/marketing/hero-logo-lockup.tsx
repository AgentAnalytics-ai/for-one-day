'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'

/**
 * Hero-only: sunrise mark above the main headline (wordmark lives in the header).
 */
export function HeroLogoLockup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setIsVisible(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="mb-8 flex justify-center md:mb-10">
      <div
        className={`transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <SunMotif animated={isVisible} className="h-10 w-auto md:h-12" aria-hidden />
      </div>
    </div>
  )
}
