import { createServiceRoleClient } from '@/lib/supabase/service-role'

const USERS_PER_PAGE = 1000
const MAX_PAGES = 25

/**
 * Resolves auth user id by email via Admin API (service role).
 * Paginates until match or cap; replace with indexed lookup if user volume grows large.
 */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createServiceRoleClient()
  if (!admin) {
    console.warn('findUserIdByEmail: SUPABASE_SERVICE_ROLE_KEY not configured')
    return null
  }

  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    })

    if (error) {
      console.error('findUserIdByEmail listUsers:', error.message)
      return null
    }

    const users = data?.users ?? []
    const found = users.find((u) => u.email?.toLowerCase() === normalized)
    if (found) return found.id

    if (users.length < USERS_PER_PAGE) break
  }

  return null
}
