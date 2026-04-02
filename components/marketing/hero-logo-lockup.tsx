'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'

export function HeroLogoLockup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setIsVisible(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="mb-10 flex justify-center">
      <div className="inline-flex flex-col items-center gap-3">
        <div
          className={`rounded-full bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 transition-all duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <SunMotif className="h-8 w-auto" />
        </div>
        <span
          className={`font-serif font-semibold tracking-tight text-slate-900 text-2xl md:text-3xl transition-all duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
          style={{ transitionDelay: '120ms' }}
        >
          For One Day
        </span>
      </div>
    </div>
  )
}

