'use client'

import Link from 'next/link'
import { useWallMode } from '@/lib/use-wall-mode'

/** Subtle memory entry — phone only, hidden on kitchen wall. */
export function MemoryPhoneLink() {
  const isWall = useWallMode()
  if (isWall) return null

  return (
    <p className="mx-auto max-w-3xl text-center">
      <Link
        href="/more/gallery"
        className="text-sm font-medium text-[#5C6478] underline-offset-4 transition-colors hover:text-primary-900 hover:underline"
      >
        Add photos for kitchen tablet →
      </Link>
    </p>
  )
}
