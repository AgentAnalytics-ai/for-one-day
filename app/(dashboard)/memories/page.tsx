import Link from 'next/link'
import { MemoriesBrowser } from '@/components/memories/memories-browser'
import { PageHeader } from '@/components/ui/page-header'

export default function MemoriesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="← Today"
        eyebrow="Today"
        title="Memories"
        subtitle={
          <>
            Everything you&apos;ve saved, organized by person. Add people and capture moments from{' '}
            <Link href="/dashboard" className="text-blue-800 font-medium hover:underline">
              Today
            </Link>
            .
          </>
        }
      />
      <MemoriesBrowser />
      <p className="text-xs text-slate-500 pt-4 border-t border-slate-200">
        Earlier reflection entries (if any) live in{' '}
        <Link href="/reflections/history" className="text-blue-800 hover:underline">
          reflections history
        </Link>
        .
      </p>
    </div>
  )
}
