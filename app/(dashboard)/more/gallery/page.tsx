import Link from 'next/link'
import { WallGalleryManager } from '@/components/gallery/wall-gallery-manager'

export default function WallGalleryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <header>
        <Link
          href="/more"
          className="text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
        >
          ← More
        </Link>
        <h1 className="page-title mt-4">Kitchen tablet photos</h1>
        <p className="page-subtitle mt-1">
          Photos only — they rotate on the wall. No notes, no journaling.
        </p>
      </header>
      <WallGalleryManager />
    </div>
  )
}
