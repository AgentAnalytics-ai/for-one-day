'use client'

import { useEffect, useState } from 'react'
import { useWallMode } from '@/lib/use-wall-mode'
import type { WallSlideshowPayload } from '@/lib/wall-slideshow'

const EMPTY: WallSlideshowPayload = { images: [], timezone: 'America/Chicago' }

export function useWallSlideshow() {
  const isWall = useWallMode()
  const [payload, setPayload] = useState<WallSlideshowPayload>(EMPTY)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isWall) {
      setPayload(EMPTY)
      setLoaded(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/wall-slideshow')
        const data = (await res.json()) as WallSlideshowPayload & { error?: string }
        if (cancelled) return
        if (!res.ok) {
          setPayload(EMPTY)
          return
        }
        setPayload({
          images: data.images ?? [],
          timezone: data.timezone ?? EMPTY.timezone,
        })
      } catch {
        if (!cancelled) setPayload(EMPTY)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    const onRefresh = () => load()
    window.addEventListener('wall-gallery:refresh', onRefresh)
    return () => {
      cancelled = true
      window.removeEventListener('wall-gallery:refresh', onRefresh)
    }
  }, [isWall])

  return { ...payload, loaded, hasPhotos: payload.images.length > 0 }
}
