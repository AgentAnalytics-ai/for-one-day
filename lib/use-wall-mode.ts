'use client'

import { useEffect, useState } from 'react'

/**
 * Kitchen wall = landscape tablet at lg+.
 * Wall gets daily ops only; phone gets More (memories/keepsakes).
 */
export function useWallMode() {
  const [isWall, setIsWall] = useState(false)

  useEffect(() => {
    const mqLandscape = window.matchMedia('(orientation: landscape)')
    const mqWide = window.matchMedia('(min-width: 1024px)')

    const update = () => {
      setIsWall(mqLandscape.matches && mqWide.matches)
    }

    update()
    mqLandscape.addEventListener('change', update)
    mqWide.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      mqLandscape.removeEventListener('change', update)
      mqWide.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return isWall
}
