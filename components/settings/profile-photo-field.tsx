'use client'

import { useId, useRef } from 'react'
import { useVaultPhotoUrl } from '@/hooks/use-vault-photo-url'

interface ProfilePhotoFieldProps {
  previewUrl: string | null
  onClear: () => void
  onPickFile: (file: File) => void
  disabled?: boolean
}

/**
 * Lightweight profile picker: user-initiated file dialog, short privacy note, optional preview.
 */
export function ProfilePhotoField({
  previewUrl,
  onClear,
  onPickFile,
  disabled,
}: ProfilePhotoFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPickFile(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          {previewUrl ? 'Change photo' : 'Add photo'}
        </button>
        {previewUrl && (
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="text-sm text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        Optional. Shown only in your account. We never access your camera or library until you choose a file.
      </p>
      {previewUrl && (
        <div className="relative inline-block pt-1">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </div>
  )
}

/** List row avatar: resolves vault path or legacy URL. */
export function ProfileAvatar({
  photoRef,
  name,
  frameClass = 'h-12 w-12',
  initialClassName = 'text-lg',
}: {
  photoRef: string | null
  name: string
  /** e.g. h-16 w-16 */
  frameClass?: string
  /** Letter size for fallback initial */
  initialClassName?: string
}) {
  const url = useVaultPhotoUrl(photoRef)
  const initial = name.charAt(0).toUpperCase() || '?'

  if (url) {
    return (
      <div
        className={`flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 ${frameClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 font-semibold text-white ${initialClassName} ${frameClass}`}
      aria-hidden
    >
      {initial}
    </div>
  )
}
