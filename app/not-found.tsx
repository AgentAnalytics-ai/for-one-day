import Link from 'next/link'

/**
 * Global 404 UI (also used when prod middleware rewrites blocked debug routes).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-50 px-4">
      <h1 className="font-serif text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-center text-sm text-slate-600">
        That link doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-4 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
      >
        Go home
      </Link>
    </div>
  )
}
