'use client'

import { useEffect, useState } from 'react'
import { SunMotif } from '@/components/brand/sun-motif'
import { useWallMode } from '@/lib/use-wall-mode'
import { useWallSlideshow } from '@/lib/use-wall-slideshow'
import { WallSlideshowCanvas } from '@/components/dashboard/wall-slideshow-canvas'
import type { WallSlideshowImage } from '@/lib/wall-slideshow'

type WallPhotoFullscreenProps = {
  open: boolean
  onClose: () => void
  images: WallSlideshowImage[]
  timezone: string
  mode?: 'focus' | 'idle'
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

function GalleryChromeBar({
  mode,
  clock,
  onClose,
}: {
  mode: 'focus' | 'idle'
  clock?: string
  onClose: () => void
}) {
  return (
    <header className="wall-photo-fullscreen__bar shrink-0">
      <div className="wall-photo-fullscreen__brand">
        <SunMotif animated className="h-6 w-auto sm:h-7" />
        <span className="font-serif text-sm font-medium tracking-[-0.01em] text-primary-950 sm:text-base">
          For One Day
        </span>
      </div>
      {mode === 'idle' && clock ? (
        <p className="wall-photo-fullscreen__clock font-serif text-sm font-medium text-primary-900 sm:text-base">
          {clock}
        </p>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="wall-photo-fullscreen__close touch-tablet text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
        >
          Close
        </button>
      )}
    </header>
  )
}

/** Gallery — white chrome, photo on mat. */
export function WallPhotoFullscreen({
  open,
  onClose,
  images,
  timezone,
  mode = 'focus',
}: WallPhotoFullscreenProps) {
  const [clock, setClock] = useState(() => formatWallClock(timezone))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || mode !== 'idle') return
    setClock(formatWallClock(timezone))
    const t = setInterval(() => setClock(formatWallClock(timezone)), 30_000)
    return () => clearInterval(t)
  }, [open, mode, timezone])

  if (!open || images.length === 0) return null

  return (
    <div
      className="wall-photo-fullscreen fixed inset-0 z-[200] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'idle' ? 'Kitchen tablet gallery' : 'Full screen photos'}
    >
      <GalleryChromeBar mode={mode} clock={clock} onClose={onClose} />

      <div className="wall-photo-fullscreen__stage min-h-0 flex-1">
        <WallSlideshowCanvas images={images} variant="fullscreen" fit="contain" className="h-full w-full" />
      </div>

      <footer className="wall-photo-fullscreen__bar wall-photo-fullscreen__bar--foot shrink-0">
        {mode === 'focus' ? (
          <button
            type="button"
            onClick={onClose}
            className="touch-tablet btn-primary mx-auto w-full max-w-xs"
          >
            Back to Today
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="touch-tablet mx-auto text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
          >
            Tap to wake
          </button>
        )}
      </footer>
    </div>
  )
}

/** Side portrait frame on the kitchen wall — tap for gallery. No counts, no labels. */
export function WallPhotoFrame() {
  const isWall = useWallMode()
  const { images, hasPhotos, loaded, timezone } = useWallSlideshow()
  const [focused, setFocused] = useState(false)

  if (!isWall || !loaded || !hasPhotos) return null

  return (
    <>
      <aside className="today-glance-gallery">
        <button
          type="button"
          onClick={() => setFocused(true)}
          className="today-wall-photo-frame group w-full text-left"
          aria-label="Open photos"
        >
          <div className="today-wall-photo-frame__mat">
            <div className="today-wall-photo-frame__window">
              <WallSlideshowCanvas images={images} variant="frame" fit="contain" />
            </div>
          </div>
        </button>
      </aside>

      <WallPhotoFullscreen
        open={focused}
        onClose={() => setFocused(false)}
        images={images}
        timezone={timezone}
        mode="focus"
      />
    </>
  )
}
