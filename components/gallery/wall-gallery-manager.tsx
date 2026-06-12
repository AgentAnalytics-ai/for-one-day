'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { toast } from '@/lib/toast'

type GalleryPhoto = {
  id: string
  url: string
  storage_path: string
  created_at: string
}

type PendingPhoto = {
  storage_path: string
  url: string
  uploading?: boolean
}

/**
 * Kitchen tablet gallery — photos only. One image = one slot on the wall rotation.
 */
export function WallGalleryManager() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [pending, setPending] = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [missingTable, setMissingTable] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/wall-gallery')
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.includes('013_family_wall_photos')) {
          setMissingTable(true)
        }
        return
      }
      setPhotos(data.photos ?? [])
      setMissingTable(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPending((prev) => [...prev, { storage_path: tempId, url: tempUrl, uploading: true }])

      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/memories/upload-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        URL.revokeObjectURL(tempUrl)
        setPending((prev) =>
          prev.map((p) =>
            p.storage_path === tempId
              ? { storage_path: data.image.storage_path, url: data.image.url || tempUrl, uploading: false }
              : p
          )
        )
      } catch (err) {
        URL.revokeObjectURL(tempUrl)
        setPending((prev) => prev.filter((p) => p.storage_path !== tempId))
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  const removePending = (path: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.storage_path === path)
      if (item?.storage_path.startsWith('temp-')) URL.revokeObjectURL(item.url)
      return prev.filter((p) => p.storage_path !== path)
    })
  }

  const addToGallery = async () => {
    const ready = pending.filter((p) => !p.uploading && !p.storage_path.startsWith('temp-'))
    if (ready.length === 0) {
      toast.error('Add photos first')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/wall-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storage_paths: ready.map((p) => p.storage_path) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not add photos')

      toast.success(
        data.added === 1 ? '1 photo added to your tablet' : `${data.added} photos added to your tablet`
      )
      setPending([])
      await load()
      window.dispatchEvent(new CustomEvent('wall-gallery:refresh'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add photos')
    } finally {
      setSaving(false)
    }
  }

  const removePhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/wall-gallery/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not remove')
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      toast.success('Removed from tablet')
      window.dispatchEvent(new CustomEvent('wall-gallery:refresh'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove')
    }
  }

  const pendingReady = pending.filter((p) => !p.uploading && !p.storage_path.startsWith('temp-'))
  const pendingUploading = pending.some((p) => p.uploading)

  if (missingTable) {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        Run <code className="rounded bg-white/80 px-1 text-xs">013_family_wall_photos.sql</code> in Supabase
        to enable the kitchen tablet gallery.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-5 sm:p-6">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D4CFC6] bg-[#FAF7F2]/50 px-6 py-10 transition-colors hover:border-primary-300/60 hover:bg-[#FAF7F2]"
        >
          <ImageIcon className="h-8 w-8 text-primary-900/70" strokeWidth={1.5} />
          <span className="font-serif text-lg font-medium text-primary-900">Add photos</span>
          <span className="text-sm text-[#5C6478]">Select many at once — each photo rotates on the wall</span>
        </button>

        {pending.length > 0 ? (
          <div className="mt-5">
            <p className="section-label mb-3">
              Ready to add · {pendingReady.length}
              {pendingUploading ? ' (uploading…)' : ''}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {pending.map((p) => (
                <div key={p.storage_path} className="relative aspect-square overflow-hidden rounded-xl bg-[#F3EDE4]">
                  {p.uploading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
                    </div>
                  ) : (
                    <>
                      <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => removePending(p.storage_path)}
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <PremiumButton
              type="button"
              onClick={addToGallery}
              disabled={saving || pendingUploading || pendingReady.length === 0}
              className="mt-4 w-full sm:w-auto"
            >
              {saving ? 'Adding…' : `Add ${pendingReady.length} to kitchen tablet`}
            </PremiumButton>
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-title text-primary-900">On your tablet now</h2>
          {!loading ? (
            <span className="text-sm tabular-nums text-[#5C6478]">{photos.length} photos</span>
          ) : null}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-[#5C6478]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading gallery…
          </div>
        ) : photos.length === 0 ? (
          <p className="rounded-2xl border border-[#E7E2DA] bg-white/80 px-4 py-6 text-center text-sm text-[#5C6478]">
            No photos yet. Add some above — they&apos;ll crossfade on Today and fill the screen when the tablet is idle.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F3EDE4]">
                <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Remove from tablet"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
