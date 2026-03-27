'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { MemoryImageLightbox } from '@/components/memories/memory-image-lightbox'

type Mem = {
  id: string
  body_text: string
  polished_text: string | null
  media_urls: string[]
  created_at: string
  preview_url?: string | null
}

export function PersonMemoriesTimeline({
  personId,
  displayName,
}: {
  personId: string
  displayName: string
}) {
  const [memories, setMemories] = useState<Mem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/memories?person_id=${personId}&limit=100&sign=1`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMemories(data.memories || [])
    } catch {
      toast.error('Could not load memories')
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onRefresh = () => load()
    window.addEventListener('memories:refresh', onRefresh)
    return () => window.removeEventListener('memories:refresh', onRefresh)
  }, [load])

  const remove = async (id: string) => {
    if (!confirm('Delete this memory?')) return
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setMemories((prev) => prev.filter((m) => m.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading memories for {displayName}…</p>
  }

  if (!memories.length) {
    return (
      <p className="text-slate-600">
        No memories for {displayName} yet.{' '}
        <Link href="/dashboard" className="text-blue-800 font-medium hover:underline">
          Add one from Today
        </Link>
        .
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-4">
        {memories.map((m) => {
        const text = (m.polished_text || m.body_text || '').trim()
        return (
          <li
            key={m.id}
            className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => {
                if (m.preview_url) setLightboxUrl(m.preview_url)
              }}
              className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={m.preview_url ? 'Open memory photo' : 'No photo available'}
              disabled={!m.preview_url}
            >
              {m.preview_url ? (
                <Image src={m.preview_url} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs p-2 text-center">
                  No photo
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs text-slate-500">
                  {format(new Date(m.created_at), 'MMMM d, yyyy · h:mm a')}
                </span>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap mt-2">{text || '—'}</p>
            </div>
          </li>
        )
        })}
      </ul>
      <MemoryImageLightbox
        open={!!lightboxUrl}
        imageUrl={lightboxUrl}
        title={`${displayName} memory photo`}
        onClose={() => setLightboxUrl(null)}
      />
    </>
  )
}
