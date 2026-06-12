'use client'

import { usePathname } from 'next/navigation'
import { useWallMode } from '@/lib/use-wall-mode'
import { useWallIdle } from '@/lib/use-wall-idle'
import { useWallSlideshow } from '@/lib/use-wall-slideshow'
import { WallPhotoFullscreen } from '@/components/dashboard/wall-photo-frame'

const DAILY_OPS_PATHS = ['/dashboard', '/lists', '/week']

function isDailyOpsPath(pathname: string) {
  return DAILY_OPS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Full-screen ambient gallery when the kitchen tablet is idle.
 */
export function WallIdleGallery() {
  const pathname = usePathname() ?? ''
  const isWall = useWallMode()
  const { images, hasPhotos, timezone } = useWallSlideshow()
  const dailyOps = isDailyOpsPath(pathname)
  const { isIdle, wake } = useWallIdle(undefined, dailyOps && hasPhotos)

  if (!isWall || !dailyOps || !hasPhotos) return null

  return (
    <WallPhotoFullscreen
      open={isIdle}
      onClose={wake}
      images={images}
      timezone={timezone}
      mode="idle"
    />
  )
}
