'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resolveVaultPhotoUrl } from '@/lib/profile-photo'

/**
 * Resolves a vault storage path or legacy public URL for display in the UI.
 */
export function useVaultPhotoUrl(photoRef: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!photoRef) {
        setUrl(null)
        return
      }
      const supabase = createClient()
      const resolved = await resolveVaultPhotoUrl(supabase, photoRef)
      if (!cancelled) setUrl(resolved)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [photoRef])

  return url
}
