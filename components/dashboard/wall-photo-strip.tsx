'use client'

import { useWallMode } from '@/lib/use-wall-mode'
import { useWallSlideshow } from '@/lib/use-wall-slideshow'
import { WallSlideshowCanvas } from '@/components/dashboard/wall-slideshow-canvas'

/** Thin photo strip between greeting and cards — wall only, when photos exist. */
export function WallPhotoStrip() {
  const isWall = useWallMode()
  const { images, hasPhotos, loaded } = useWallSlideshow()

  if (!isWall || !loaded || !hasPhotos) return null

  return (
    <div className="today-wall-photo-strip" aria-hidden>
      <WallSlideshowCanvas images={images} variant="strip" />
    </div>
  )
}
