'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'

const PLAY_MS = 900
const FADE_MS = 500

function clearWelcomeAttrs() {
  const root = document.documentElement
  root.removeAttribute('data-welcome-active')
  root.removeAttribute('data-welcome-reveal')
  root.removeAttribute('data-brand-settled')
}

/**
 * Login splash — must always exit (Strict Mode safe, 2.5s hard kill).
 */
export function BrandEntrance() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const shouldPlay = url.searchParams.get('welcome') === '1'

    if (!shouldPlay) {
      clearWelcomeAttrs()
      setVisible(false)
      setExiting(false)
      return
    }

    url.searchParams.delete('welcome')
    window.history.replaceState(
      null,
      '',
      url.pathname + url.search + url.hash
    )

    document.documentElement.setAttribute('data-welcome-active', 'true')
    setVisible(true)
    setExiting(false)

    const beginExit = () => {
      setExiting(true)
      document.documentElement.removeAttribute('data-welcome-active')
      document.documentElement.setAttribute('data-welcome-reveal', 'true')
      document.documentElement.setAttribute('data-brand-settled', 'true')
    }

    const finish = () => {
      setVisible(false)
      setExiting(false)
      clearWelcomeAttrs()
    }

    const exitTimer = window.setTimeout(beginExit, PLAY_MS)
    const finishTimer = window.setTimeout(finish, PLAY_MS + FADE_MS)
    const safetyTimer = window.setTimeout(finish, 2500)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(finishTimer)
      window.clearTimeout(safetyTimer)
      finish()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`brand-cinematic-overlay pointer-events-none fixed inset-0 z-[200] flex items-center justify-center ${
        exiting ? 'brand-cinematic-overlay--out' : ''
      }`}
      aria-hidden
      onAnimationEnd={(e) => {
        if (exiting && e.animationName.includes('brand-cinematic-overlay-out')) {
          setVisible(false)
          clearWelcomeAttrs()
        }
      }}
    >
      <div className={`brand-cinematic-glow ${exiting ? 'brand-cinematic-glow--out' : ''}`} />
      <div className={`brand-cinematic-lockup ${exiting ? 'brand-cinematic-lockup--out' : ''}`}>
        <SunMotif animated className="brand-cinematic-sun h-11 w-auto sm:h-12" />
        <div className="brand-cinematic-wordmark">
          <span className="font-serif text-xl font-light tracking-tight text-primary-900 sm:text-2xl">
            For One Day
          </span>
        </div>
        <p className="brand-cinematic-tagline text-sm font-medium text-[#5C6478]">
          Know what matters today
        </p>
      </div>
    </div>
  )
}
