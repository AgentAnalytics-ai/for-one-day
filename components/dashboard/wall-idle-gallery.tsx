'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useWallMode } from '@/lib/use-wall-mode'
import { useWallIdle } from '@/lib/use-wall-idle'
import { useWallSlideshow } from '@/lib/use-wall-slideshow'
import { WallSlideshowCanvas } from '@/components/dashboard/wall-slideshow-canvas'

const DAILY_OPS_PATHS = ['/dashboard', '/lists', '/week']

function isDailyOpsPath(pathname: string) {
  return DAILY_OPS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function formatWallClock(timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
  }
}

/**
 * Full-screen ambient gallery when the kitchen tablet is idle.
 * Any tap returns to daily ops.
 */
export function WallIdleGallery() {
  const pathname = usePathname() ?? ''
  const isWall = useWallMode()
  const { images, hasPhotos, timezone } = useWallSlideshow()
  const dailyOps = isDailyOpsPath(pathname)
  const { isIdle, wake } = useWallIdle(undefined, dailyOps && hasPhotos)
  const [clock, setClock] = useState(() => formatWallClock(timezone))

  useEffect(() => {
    if (!isIdle) return
    setClock(formatWallClock(timezone))
    const t = setInterval(() => setClock(formatWallClock(timezone)), 30_000)
    return () => clearInterval(t)
  }, [isIdle, timezone])

  if (!isWall || !dailyOps || !hasPhotos || !isIdle) return null

  return (
    <button
      type="button"
      className="wall-idle-gallery fixed inset-0 z-[200] flex cursor-default flex-col border-0 bg-[#1a2744] p-0 text-left"
      onClick={wake}
      aria-label="Tap to return to Today"
    >
      <WallSlideshowCanvas images={images} variant="fullscreen" className="absolute inset-0" />

      <div className="relative z-10 mt-auto px-6 pb-8 pt-16 sm:px-10 sm:pb-10">
        <p className="font-serif text-2xl font-medium text-white sm:text-3xl">{clock}</p>
        <p className="mt-2 text-sm font-medium text-white/70">Tap anywhere to wake</p>
      </div>
    </button>
  )
}
