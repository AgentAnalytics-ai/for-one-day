import Link from 'next/link'
import { MemoriesBrowser } from '@/components/memories/memories-browser'

export default function MemoriesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-800 hover:underline mb-4 inline-block">
          ← Today
        </Link>
        <h1 className="text-3xl font-serif font-light text-gray-900">Memories</h1>
        <p className="text-slate-600 mt-2">
          Everything you&apos;ve saved, organized by person. Add people and capture moments from{' '}
          <Link href="/dashboard" className="text-blue-800 font-medium hover:underline">
            Today
          </Link>
          .
        </p>
      </div>
      <MemoriesBrowser />
      <p className="text-xs text-slate-500 pt-4 border-t border-slate-200">
        Earlier daily journal entries (if any) live in{' '}
        <Link href="/reflections/history" className="text-blue-800 hover:underline">
          journal history
        </Link>
        .
      </p>
    </div>
  )
}
