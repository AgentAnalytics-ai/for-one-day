'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { WallSlideshowImage } from '@/lib/wall-slideshow'
import { WALL_SLIDESHOW_INTERVAL_MS } from '@/lib/wall-slideshow'

type WallSlideshowCanvasProps = {
  images: WallSlideshowImage[]
  variant?: 'strip' | 'frame' | 'fullscreen'
  fit?: 'cover' | 'contain'
  intervalMs?: number
  className?: string
}

/** Calm crossfade — strip, framed preview, or gallery stage. */
export function WallSlideshowCanvas({
  images,
  variant = 'strip',
  fit = 'cover',
  intervalMs = WALL_SLIDESHOW_INTERVAL_MS,
  className,
}: WallSlideshowCanvasProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % images.length)
        setVisible(true)
      }, 700)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  if (images.length === 0) return null

  const current = images[index]

  const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover'
  const stageBg = fit === 'contain' ? 'bg-[#F3EDE4]' : 'bg-[#1a2744]'

  return (
    <div
      className={cn(
        'wall-slideshow-canvas relative overflow-hidden',
        stageBg,
        variant === 'strip' && 'wall-slideshow-canvas--strip',
        variant === 'frame' && 'wall-slideshow-canvas--frame',
        variant === 'fullscreen' && 'wall-slideshow-canvas--fullscreen',
        className
      )}
      aria-hidden={variant !== 'frame'}
    >
      <Image
        key={current.id}
        src={current.url}
        alt=""
        fill
        unoptimized
        priority={variant === 'strip' || variant === 'frame'}
        className={cn(
          objectFit,
          'transition-opacity duration-[700ms] ease-in-out',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        sizes="100vw"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          fit === 'contain' && 'hidden',
          variant === 'strip' && 'bg-gradient-to-t from-[#1a2744]/25 via-transparent to-transparent',
          variant === 'frame' && 'bg-gradient-to-t from-[#1a2744]/30 via-transparent to-transparent',
          variant === 'fullscreen' && fit === 'cover' && 'bg-gradient-to-t from-[#1a2744]/70 via-[#1a2744]/10 to-[#1a2744]/20'
        )}
      />
    </div>
  )
}
