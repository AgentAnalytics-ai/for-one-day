import Link from 'next/link'

/**
 * Our focus — household intentions (vision: warm, not corporate OKRs).
 */
export function FocusView() {
  const focus = {
    title: 'Be present at dinner',
    detail: 'Phones away. Everyone shares one good thing from the day.',
    season: 'This season',
    seasonNote: 'Build rhythms that help our family feel calm at home.',
  }

  return (
    <div id="focus" className="scroll-mt-24 space-y-4">
      <div className="kw-focus-line surface-card p-5 sm:p-6">
        <p className="section-label mb-2">Our focus</p>
        <p className="font-serif text-2xl font-medium text-primary-900">{focus.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#5C6478]">{focus.detail}</p>
      </div>

      <div className="surface-inset p-5">
        <p className="section-label mb-2">{focus.season}</p>
        <p className="text-sm leading-relaxed text-[#5C6478]">{focus.seasonNote}</p>
        <p className="mt-4 text-xs text-[#5C6478]/80">
          Editable household focus lands with shared widgets (Step 6). Shows as one quiet line on Today and the kitchen wall.
        </p>
      </div>

      <p className="text-center text-sm">
        <Link href="/dashboard" className="font-medium text-primary-900 hover:underline">
          See on Today →
        </Link>
      </p>
    </div>
  )
}
