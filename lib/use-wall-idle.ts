'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWallMode } from '@/lib/use-wall-mode'
import { WALL_IDLE_TIMEOUT_MS } from '@/lib/wall-slideshow'

/**
 * Kitchen wall idle — no touch for N minutes → ambient gallery mode.
 */
export function useWallIdle(timeoutMs = WALL_IDLE_TIMEOUT_MS, enabled = true) {
  const isWall = useWallMode()
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdle = useCallback(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isWall || !enabled) return
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs)
  }, [enabled, isWall, timeoutMs])

  useEffect(() => {
    if (!isWall || !enabled) {
      setIsIdle(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    resetIdle()

    const events = ['pointerdown', 'keydown', 'touchstart'] as const
    for (const event of events) {
      window.addEventListener(event, resetIdle, { passive: true })
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of events) {
        window.removeEventListener(event, resetIdle)
      }
    }
  }, [enabled, isWall, resetIdle])

  return { isIdle, wake: resetIdle }
}
