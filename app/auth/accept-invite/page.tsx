import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { acceptHouseholdInvitation } from '@/app/actions/household-actions'
import { Header } from '@/components/header'

/**
 * Household invitation landing — existing users sign in; new users sign up.
 */
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error: queryError } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!token?.trim()) {
    return (
      <InviteShell>
        <p className="text-gray-600">This invitation link is invalid or incomplete.</p>
        <Link href="/auth/login" className="text-primary-700 font-medium hover:underline">
          Sign in
        </Link>
      </InviteShell>
    )
  }

  const trimmedToken = token.trim()
  const encodedToken = encodeURIComponent(trimmedToken)
  const returnPath = `/auth/accept-invite?token=${encodedToken}`

  if (!user) {
    return (
      <InviteShell>
        <h1 className="text-2xl font-serif font-light text-gray-900 mb-3">
          Join your household
        </h1>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Sign in with the email that received this invite. If you already have a solo free home,
          accepting will move you into this household — your memories stay with you.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/auth/password?next=${encodeURIComponent(returnPath)}`}
            className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800"
          >
            Sign in to accept
          </Link>
          <Link
            href={`/auth/signup?token=${encodedToken}`}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Create account
          </Link>
        </div>
      </InviteShell>
    )
  }

  const result = await acceptHouseholdInvitation(trimmedToken)

  if (result.success) {
    redirect('/dashboard?joined=household')
  }

  return (
    <InviteShell>
      <h1 className="text-2xl font-serif font-light text-gray-900 mb-3">
        Couldn&apos;t join household
      </h1>
      <p className="text-gray-600 mb-6">
        {result.error || queryError || 'This invitation may have expired.'}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800"
        >
          Go to dashboard
        </Link>
        <Link
          href="/settings#household"
          className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Household settings
        </Link>
      </div>
    </InviteShell>
  )
}

function InviteShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-4">{children}</div>
      </div>
    </main>
  )
}
