'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageModal } from './image-modal'

interface ReflectionImagesProps {
  images: string[]
}

/**
 * 🖼️ Reflection Images Component
 * Displays images in a grid with click-to-expand functionality
 */
export function ReflectionImages({ images }: ReflectionImagesProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
        {images.map((url, index) => (
          <button
            key={index}
            onClick={() => {
              setModalIndex(index)
              setModalOpen(true)
            }}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
          >
            <Image
              src={url}
              alt={`Reflection image ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Image Modal */}
      {modalOpen && (
        <ImageModal
          images={images}
          currentIndex={modalIndex}
          onClose={() => setModalOpen(false)}
          onNext={() => setModalIndex((prev) => Math.min(prev + 1, images.length - 1))}
          onPrevious={() => setModalIndex((prev) => Math.max(prev - 1, 0))}
        />
      )}
    </>
  )
}

