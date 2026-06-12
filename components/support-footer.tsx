'use client'

/**
 * Minimal support link — hidden on kitchen wall to preserve no-scroll Today.
 */

import { useWallMode } from '@/lib/use-wall-mode'
import { SupportContactButton } from './support-contact-button'

export function SupportFooter() {
  const isWall = useWallMode()
  if (isWall) return null

  return (
    <footer className="mt-auto py-2 sm:py-3 border-t border-gray-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2">
          <SupportContactButton />
        </div>
      </div>
    </footer>
  )
}

