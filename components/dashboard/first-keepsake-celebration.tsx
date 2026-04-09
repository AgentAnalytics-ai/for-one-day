'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'

const FLAG_KEY = 'fod-show-first-keepsake-celebration'

export function FirstKeepsakeCelebration() {
  const [open, setOpen] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shouldShow = window.localStorage.getItem(FLAG_KEY) === '1'
    if (!shouldShow) return

    setOpen(true)
    const id = window.setTimeout(() => setAnimate(true), 30)
    return () => window.clearTimeout(id)
  }, [])

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FLAG_KEY)
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="mb-6 md:mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`rounded-xl bg-slate-900 p-2 transition-all duration-500 ease-out ${
            animate ? 'scale-100 opacity-100 shadow-md' : 'scale-95 opacity-0'
          }`}
        >
          <SunMotif animated={animate} className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="card-heading">A new day in their story</h3>
          <p className="mt-1 text-sm text-slate-600">You&apos;ve saved your first keepsake.</p>
          <div className="mt-3">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Keep capturing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

