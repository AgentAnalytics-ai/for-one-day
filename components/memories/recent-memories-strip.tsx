'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

type Row = {
  id: string
  person_id: string
  body_text: string
  polished_text: string | null
  media_urls: string[]
  created_at: string
  preview_url?: string | null
  memory_people: { display_name: string } | null
}

export function RecentMemoriesStrip() {
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [missingTable, setMissingTable] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/memories?limit=8&sign=1')
      const data = await res.json()
      if (data.code === 'TABLE_MISSING') {
        setMissingTable(true)
        setItems([])
        return
      }
      if (!res.ok) return
      setItems(data.memories || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onRefresh = () => load()
    window.addEventListener('memories:refresh', onRefresh)
    return () => window.removeEventListener('memories:refresh', onRefresh)
  }, [load])

  if (missingTable) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Run <code className="text-xs bg-white/80 px-1 rounded">supabase/add-memory-people-and-memories.sql</code> in Supabase to
        enable memories.
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-slate-500 py-4">Loading recent memories…</div>
  }

  if (!items.length) {
    return (
      <p className="text-sm text-slate-600 py-2">
        No memories yet. Save your first one above — they&apos;ll show up here and under each person on{' '}
        <Link href="/memories" className="text-blue-800 font-medium hover:underline">
          Memories
        </Link>
        .
      </p>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold text-gray-900 mb-3">Recent memories</h3>
      <ul className="grid sm:grid-cols-2 gap-3">
        {items.map((m) => {
          const text = (m.polished_text || m.body_text || '').trim()
          const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text
          const name = m.memory_people?.display_name || 'Someone'
          return (
            <li key={m.id}>
              <Link
                href={`/memories/${m.person_id}`}
                className="flex gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  {m.preview_url ? (
                    <Image src={m.preview_url} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center px-1">
                      No photo
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-900">{name}</p>
                  <p className="text-xs text-slate-500">{format(new Date(m.created_at), 'MMM d, yyyy')}</p>
                  <p className="text-sm text-slate-800 line-clamp-2 mt-1">{preview || 'Photo memory'}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
