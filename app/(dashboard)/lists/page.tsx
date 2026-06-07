import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function ListsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">Lists</span>}
          title="To do & shopping"
          subtitle="Check off from the kitchen wall or your phone. Shared lists arrive at Step 6."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="surface-card divide-y divide-[#F0EBE3]">
          <ListSection title="To do today" empty="Add your first task when shared lists ship." />
          <ListSection title="Shopping" empty="Groceries for tonight's dinner will show here." />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <p className="text-center text-sm text-[#5C6478]">
          <Link href="/dashboard" className="font-medium text-primary-900 hover:underline">
            ← Back to Today
          </Link>
        </p>
      </ScrollReveal>
    </div>
  )
}

function ListSection({ title, empty }: { title: string; empty: string }) {
  return (
    <div className="p-5 sm:p-6">
      <h2 className="section-label mb-4">{title}</h2>
      <div className="rounded-xl border border-dashed border-[#E7E2DA] bg-[#FAF7F2]/50 px-4 py-8 text-center">
        <p className="text-sm text-[#5C6478]">{empty}</p>
        <button
          type="button"
          disabled
          className="btn-secondary mt-4 cursor-not-allowed opacity-60"
        >
          + Add to today
        </button>
      </div>
    </div>
  )
}
