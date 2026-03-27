'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Trash2, User } from 'lucide-react'
import { toast } from '@/lib/toast'
import { MemoryImageLightbox } from '@/components/memories/memory-image-lightbox'

type Person = { id: string; display_name: string; relationship: string | null }
type Mem = {
  id: string
  person_id: string
  body_text: string
  polished_text: string | null
  media_urls: string[]
  created_at: string
  preview_url?: string | null
  memory_people: { display_name: string } | null
}

export function MemoriesBrowser() {
  const [people, setPeople] = useState<Person[]>([])
  const [memories, setMemories] = useState<Mem[]>([])
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxTitle, setLightboxTitle] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pr, mr] = await Promise.all([
        fetch('/api/memories/people'),
        fetch(`/api/memories?limit=100&sign=1${filter ? `&person_id=${filter}` : ''}`),
      ])
      const pj = await pr.json()
      const mj = await mr.json()
      if (pj.people) setPeople(pj.people)
      if (mj.memories) setMemories(mj.memories)
    } catch {
      toast.error('Could not load memories')
    } finally {
      setLoading(false)
    }
  }, [filter])

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="mr-2 text-sm font-medium text-slate-600">Filter</span>
        <button
          type="button"
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !filter ? 'bg-blue-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Everyone
        </button>
        {people.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
              filter === p.id ? 'bg-blue-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {p.display_name}
          </button>
        ))}
      </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : memories.length === 0 ? (
        <p className="text-slate-600">
          No memories here yet.{' '}
          <Link href="/dashboard" className="text-blue-800 font-medium hover:underline">
            Capture one from Today
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {memories.map((m) => {
            const text = (m.polished_text || m.body_text || '').trim()
            const name = m.memory_people?.display_name || 'Someone'
            return (
              <li
                key={m.id}
                className="flex gap-4 p-4 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!m.preview_url) return
                    setLightboxUrl(m.preview_url)
                    setLightboxTitle(`${name} memory photo`)
                  }}
                  className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={m.preview_url ? 'Open memory photo' : 'No photo available'}
                  disabled={!m.preview_url}
                >
                  {m.preview_url ? (
                    <Image src={m.preview_url} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs p-2 text-center">
                      Text only
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/memories/${m.person_id}`}
                          className="text-sm font-semibold text-blue-900 hover:underline"
                        >
                          {name}
                        </Link>
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5">
                          {format(new Date(m.created_at), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(new Date(m.created_at), 'h:mm a')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      aria-label="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap mt-2 leading-relaxed">{text || '—'}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <MemoryImageLightbox
        open={!!lightboxUrl}
        imageUrl={lightboxUrl}
        title={lightboxTitle}
        onClose={() => setLightboxUrl(null)}
      />
    </div>
  )
}
