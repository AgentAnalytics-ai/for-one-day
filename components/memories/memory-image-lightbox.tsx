'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface MemoryImageLightboxProps {
  open: boolean
  imageUrl: string | null
  title?: string
  onClose: () => void
}

export function MemoryImageLightbox({ open, imageUrl, title, onClose }: MemoryImageLightboxProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Memory photo"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative w-full h-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={title || 'Memory photo'}
          fill
          className="object-contain"
          unoptimized
          priority
        />
      </div>
    </div>
  )
}

