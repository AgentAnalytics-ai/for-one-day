'use client'

import Link from 'next/link'
import { useWallMode } from '@/lib/use-wall-mode'

/**
 * Phone-only reflective layer — separate from kitchen wall daily ops.
 */
export function MoreHub() {
  const isWall = useWallMode()

  if (isWall) {
    return <WallMoreMessage />
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-8">
      <header className="text-center">
        <span className="page-eyebrow mb-4">Your phone</span>
        <h1 className="page-title text-balance">More</h1>
        <p className="page-subtitle mx-auto mt-2 max-w-sm">
          Tablet photos and keepsakes live here — not on the kitchen wall daily view.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <HubCard
          href="/memories"
          title="Memories"
          description="Notes and photos by person"
          icon="memories"
        />
        <HubCard
          href="/vault"
          title="Keepsakes"
          description="Letters and documents"
          icon="keepsakes"
        />
      </div>

      <Link
        href="/more/gallery"
        className="surface-card group flex items-center justify-between px-5 py-4 transition-smooth hover:border-[#D4CFC6]"
      >
        <span>
          <span className="section-label block">Kitchen tablet</span>
          <span className="font-serif text-lg font-medium text-primary-900">Add photos for the wall</span>
          <span className="mt-0.5 block text-sm text-[#5C6478]">
            Pick many at once — they rotate when the tablet is idle
          </span>
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-white transition-transform duration-300 group-hover:scale-105">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
      </Link>

      <Link
        href="/more/capture"
        className="flex items-center justify-between rounded-2xl border border-[#E7E2DA] bg-white/60 px-4 py-3 text-sm transition-smooth hover:border-[#D4CFC6]"
      >
        <span className="text-[#5C6478]">
          <span className="font-medium text-primary-900">Notes for someone</span>
          {' · '}photo + a few words (optional)
        </span>
        <span className="text-[#5C6478]">→</span>
      </Link>

      <div className="border-t border-[#E7E2DA] pt-4">
        <Link
          href="/settings#household"
          className="flex items-center justify-center gap-2 text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
        >
          <GearIcon />
          Family settings
        </Link>
      </div>
    </div>
  )
}

function WallMoreMessage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-8 text-center">
      <span className="page-eyebrow">Kitchen wall</span>
      <h1 className="page-title">Daily plan mode</h1>
      <p className="page-subtitle">
        This screen is for your phone. On the wall, stick to Today, Lists, and This week.
      </p>
      <p className="text-sm text-[#5C6478]">
        Save memories and browse keepsakes from your phone — open More there, not on the shared tablet.
      </p>
      <Link href="/dashboard" className="btn-primary inline-flex">
        Back to Today
      </Link>
    </div>
  )
}

function HubCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: 'memories' | 'keepsakes'
}) {
  return (
    <Link
      href={href}
      className="surface-card touch-tablet flex flex-col px-5 py-5 transition-smooth hover:border-[#D4CFC6]"
    >
      <span className="mb-3 text-primary-900">
        {icon === 'memories' ? <MemoriesIcon /> : <KeepsakesIcon />}
      </span>
      <span className="font-serif text-lg font-medium text-primary-900">{title}</span>
      <span className="mt-1 text-sm text-[#5C6478]">{description}</span>
    </Link>
  )
}

function MemoriesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function KeepsakesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
