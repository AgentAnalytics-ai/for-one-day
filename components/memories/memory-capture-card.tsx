'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageIcon, Loader2, Sparkles, Wand2, Plus, CheckCircle2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { toast } from '@/lib/toast'

export interface MemoryPerson {
  id: string
  display_name: string
  relationship: string | null
}

interface MemoryCaptureCardProps {
  isPro: boolean
  dailySuggestion: string
}

export function MemoryCaptureCard({ isPro, dailySuggestion }: MemoryCaptureCardProps) {
  const [people, setPeople] = useState<MemoryPerson[]>([])
  const [personId, setPersonId] = useState('')
  const [newName, setNewName] = useState('')
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [body, setBody] = useState('')
  const [polished, setPolished] = useState<string | null>(null)
  const [images, setImages] = useState<Array<{ url: string; storage_path: string; uploading?: boolean }>>([])
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [saving, setSaving] = useState(false)
  const [polishing, setPolishing] = useState<'grammar' | 'expand' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingPeople(true)
      try {
        const res = await fetch('/api/memories/people')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load people')
        const list = (data.people || []) as MemoryPerson[]
        if (cancelled) return
        setPeople(list)
        setPersonId((prev) => (prev || (list[0]?.id ?? '')))
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Could not load people')
      } finally {
        if (!cancelled) setLoadingPeople(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedPerson = people.find((p) => p.id === personId)

  const addPerson = async () => {
    const name = newName.trim()
    if (!name) {
      toast.error('Enter a name')
      return
    }
    try {
      const res = await fetch('/api/memories/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add')
      const p = data.person as MemoryPerson
      setPeople((prev) => [...prev, p].sort((a, b) => a.display_name.localeCompare(b.display_name)))
      setPersonId(p.id)
      setNewName('')
      setShowAddPerson(false)
      toast.success(`Added ${p.display_name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add person')
    }
  }

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const tempUrl = URL.createObjectURL(file)
      setImages((prev) => [...prev, { url: tempUrl, storage_path: tempId, uploading: true }])
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/memories/upload-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        URL.revokeObjectURL(tempUrl)
        setImages((prev) =>
          prev.map((img) =>
            img.storage_path === tempId
              ? { url: data.image.url || '', storage_path: data.image.storage_path, uploading: false }
              : img
          )
        )
      } catch (err) {
        URL.revokeObjectURL(tempUrl)
        setImages((prev) => prev.filter((img) => img.storage_path !== tempId))
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (path: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.storage_path === path)
      if (img?.storage_path.startsWith('temp-')) URL.revokeObjectURL(img.url)
      return prev.filter((i) => i.storage_path !== path)
    })
  }

  const runPolish = async (mode: 'grammar' | 'expand') => {
    const source = polished || body
    if (!source.trim()) {
      toast.error('Write something first')
      return
    }
    setPolishing(mode)
    try {
      const res = await fetch('/api/memories/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: source,
          mode,
          personName: selectedPerson?.display_name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'PRO_REQUIRED') {
          toast.error(data.error || 'Pro required for AI writing')
        } else {
          throw new Error(data.error || 'Polish failed')
        }
        return
      }
      setPolished(data.text)
      toast.success(mode === 'grammar' ? 'Grammar updated' : 'Expanded draft ready — review and edit')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Polish failed')
    } finally {
      setPolishing(null)
    }
  }

  const saveMemory = async () => {
    if (!personId) {
      toast.error('Choose who this is for, or add someone first')
      return
    }
    const uploading = images.some((i) => i.uploading)
    if (uploading) {
      toast.error('Wait for photos to finish uploading')
      return
    }
    const paths = images.filter((i) => !i.uploading && !i.storage_path.startsWith('temp-')).map((i) => i.storage_path)
    const raw = body.trim()
    const refined = polished !== null ? polished.trim() : ''
    if (!raw && !refined && paths.length === 0) {
      toast.error('Add a note or a photo')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personId,
          body_text: raw || refined,
          polished_text:
            polished !== null && refined.length > 0 && refined !== raw ? refined : null,
          media_urls: paths,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success('Memory saved')
      setBody('')
      setPolished(null)
      setImages([])
      window.dispatchEvent(new CustomEvent('memories:refresh'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h2 className="section-title">Capture a memory</h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
            Photo, a few words, saved for someone you love. AI writing tools are available with Pro.
          </p>
        </div>
        <p className="text-xs text-slate-500 bg-white/90 border border-slate-200 rounded-lg px-3 py-2 max-w-xs leading-relaxed">
          <span className="font-medium text-slate-700">Idea for today:</span> {dailySuggestion}
        </p>
      </div>

      {loadingPeople ? (
        <div className="flex items-center gap-2 text-slate-500 py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading…
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-xl border border-slate-200/80 bg-white/70 p-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">Who is this for?</label>
            <div className="flex flex-wrap gap-2 items-center">
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersonId(p.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    personId === p.id
                      ? 'bg-blue-900 text-white shadow'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {p.display_name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAddPerson((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Add someone
              </button>
            </div>
            {showAddPerson && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (e.g. Jamie)"
                  className="flex-1 min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  maxLength={120}
                />
                <PremiumButton type="button" onClick={addPerson} className="px-4 py-2 text-sm">
                  Save person
                </PremiumButton>
              </div>
            )}
          </div>

          <div className="mb-5 rounded-xl border border-slate-200/80 bg-white/70 p-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">Your note</label>
            <textarea
              value={polished !== null ? polished : body}
              onChange={(e) => {
                if (polished !== null) setPolished(e.target.value)
                else setBody(e.target.value)
              }}
              rows={5}
              placeholder="Proud of you today — you kept trying even when it was hard."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            {polished !== null && polished !== body && (
              <button
                type="button"
                className="mt-2 text-xs text-blue-700 hover:underline"
                onClick={() => {
                  setPolished(null)
                }}
              >
                Revert to original note
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              disabled={!!polishing || !(polished || body).trim() || !isPro}
              onClick={() => runPolish('grammar')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              {polishing === 'grammar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-slate-600" />}
              Fix grammar
              {!isPro && <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Pro</span>}
            </button>
            <button
              type="button"
              disabled={!!polishing || !(polished || body).trim() || !isPro}
              onClick={() => runPolish('expand')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              {polishing === 'expand' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-600" />}
              Expand with AI
              {!isPro && <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Pro</span>}
            </button>
          </div>
          {!isPro && (
            <p className="text-xs text-slate-600 mb-5">
              AI writing is available on Pro.{' '}
              <Link href="/upgrade" className="text-blue-800 font-medium hover:underline">
                Upgrade to unlock
              </Link>
              .
            </p>
          )}

          <div className="mb-7 rounded-xl border border-slate-200/80 bg-white/70 p-4">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-800 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Add photo
            </button>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img) => (
                  <div key={img.storage_path} className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                    {img.uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <>
                        <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeImage(img.storage_path)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs leading-6"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <PremiumButton
              type="button"
              onClick={saveMemory}
              disabled={saving || !personId}
              className="px-8 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {saving ? 'Saving…' : 'Save memory'}
            </PremiumButton>
            <Link href="/memories" className="text-sm font-medium text-blue-800 hover:underline inline-flex items-center gap-1">
              View all by person
              <CheckCircle2 className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
