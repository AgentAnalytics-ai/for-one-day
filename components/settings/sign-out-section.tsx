import { signOut } from '@/app/auth/actions'

interface SignOutSectionProps {
  userName?: string | null
  variant?: 'card' | 'inline'
}

export function SignOutSection({ userName, variant = 'card' }: SignOutSectionProps) {
  if (variant === 'inline') {
    return (
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
        >
          Sign out
        </button>
      </form>
    )
  }

  return (
    <div className="rounded-xl border border-[#E7E2DA] bg-[#FAF7F2]/60 p-4 sm:p-5">
      <h3 className="card-heading mb-1">Session</h3>
      <p className="mb-4 text-sm text-[#5C6478]">
        {userName ? (
          <>
            Signed in as <span className="font-medium text-primary-900">{userName}</span>.
          </>
        ) : (
          'Sign out of this device when someone else will use the kitchen tablet.'
        )}
      </p>
      <form action={signOut}>
        <button type="submit" className="btn-secondary w-full sm:w-auto">
          Sign out
        </button>
      </form>
    </div>
  )
}
