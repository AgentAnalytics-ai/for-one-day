'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock } from 'lucide-react'

interface MemoryReflection {
  date: string
  reflection: string
  media_urls?: string[]
}

interface MemoryCardProps {
  targetDate: string
}

export function MemoryCard({ targetDate }: MemoryCardProps) {
  const [memory, setMemory] = useState<MemoryReflection | null>(null)
  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    async function fetchMemory() {
      try {
        const response = await fetch(`/api/reflection/memories?date=${targetDate}`)
        const data = await response.json()

        if (data.success && data.exists) {
          setMemory(data.reflection)
          setExists(true)
        } else {
          setExists(false)
        }
      } catch (error) {
        console.error('Error fetching memory:', error)
        setExists(false)
      } finally {
        setLoading(false)
      }
    }

    fetchMemory()
  }, [targetDate])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!exists || !memory) {
    return null // Don't show card if no memory exists
  }

  // Format the date
  const memoryDate = new Date(memory.date)
  const formattedDate = memoryDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">This Time Last Year</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{formattedDate}</p>
      
      <div className="bg-white/80 backdrop-blur rounded-lg p-4 mb-4 border border-purple-100">
        <p className="text-gray-800 italic">&ldquo;{memory.reflection}&rdquo;</p>
      </div>

      {/* Image Gallery */}
      {memory.media_urls && memory.media_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {memory.media_urls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Memory image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {memory.media_urls.length > 4 && (
            <div className="relative aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                +{memory.media_urls.length - 4} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

