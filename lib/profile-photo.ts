/**
 * Profile photos: client-side square crop, server upload, DB stores storage path.
 * Legacy rows may still store a full https:// URL — resolve with resolveVaultPhotoUrl.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export const PROFILE_PHOTO_MAX_INPUT_BYTES = 5 * 1024 * 1024
export const PROFILE_PHOTO_EDGE = 400
export const PROFILE_PHOTO_JPEG_QUALITY = 0.88

export type ProfilePhotoKind = 'children' | 'loved-ones'

export function isLegacyPhotoHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return value.startsWith('http://') || value.startsWith('https://')
}

/**
 * Turn a stored photo reference into a URL suitable for <img src>.
 * Paths are storage object paths in the `vault` bucket; legacy values are full URLs.
 */
export async function resolveVaultPhotoUrl(
  supabase: SupabaseClient,
  photoRef: string | null | undefined
): Promise<string | null> {
  if (!photoRef) return null
  if (isLegacyPhotoHttpUrl(photoRef)) return photoRef

  const { data, error } = await supabase.storage
    .from('vault')
    .createSignedUrl(photoRef, 60 * 60 * 24 * 7)

  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function cropFileToSquareJpeg(file: File): Promise<Blob> {
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not read image'))
      img.src = objectUrl
    })

    const size = Math.min(img.width, img.height)
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2

    const canvas = document.createElement('canvas')
    canvas.width = PROFILE_PHOTO_EDGE
    canvas.height = PROFILE_PHOTO_EDGE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not available')

    ctx.drawImage(img, sx, sy, size, size, 0, 0, PROFILE_PHOTO_EDGE, PROFILE_PHOTO_EDGE)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', PROFILE_PHOTO_JPEG_QUALITY)
    )
    if (!blob) throw new Error('Could not encode image')
    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function validateProfileImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Choose an image file.'
  if (file.size > PROFILE_PHOTO_MAX_INPUT_BYTES) return 'Image must be 5MB or smaller.'
  return null
}

/** Browser-only: POST cropped JPEG to the authenticated profile-photo API. */
export async function uploadProfilePhotoBlob(
  blob: Blob,
  kind: ProfilePhotoKind
): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', blob, 'profile.jpg')
  fd.append('kind', kind)
  const res = await fetch('/api/profile-photo', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('profile-photo:', data)
    return null
  }
  return typeof data.path === 'string' ? data.path : null
}
