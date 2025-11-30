'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageModalProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

/**
 * 🖼️ Image Modal - Full-Size Lightbox
 * Instagram-style image viewer with navigation
 */
export function ImageModal({ images, currentIndex, onClose, onNext, onPrevious }: ImageModalProps) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onPrevious()
      } else if (e.key === 'ArrowRight') {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNext, onPrevious])

  if (images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Previous Button */}
      {images.length > 1 && currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage}
            alt={`Reflection image ${currentIndex + 1}`}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </div>
    </div>
  )
}

