import Link from 'next/link'
import { getListPageData } from '@/app/actions/list-actions'
import { ListsUpgradeBanner } from '@/components/lists/lists-upgrade-banner'
import { SharedListSection } from '@/components/lists/shared-list-section'
import { PageHeader } from '@/components/ui/page-header'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default async function ListsPage() {
  const result = await getListPageData()

  if (!result.success) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Lists" subtitle="Could not load your household lists." />
        <p className="text-sm text-red-700">{result.error}</p>
      </div>
    )
  }

  const { canEdit, shopping, todos } = result

  return (
    <div className="lists-page-shell mx-auto flex h-full max-w-3xl flex-col gap-6 sm:gap-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">Lists</span>}
          title="Groceries & to-do"
          subtitle={
            canEdit
              ? 'Groceries tie to meal planning — walk-throughs add what you still need.'
              : 'Upgrade to Pro to share groceries and to-dos with your household.'
          }
        />
      </ScrollReveal>

      {!canEdit ? (
        <ScrollReveal delay={50}>
          <ListsUpgradeBanner />
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={100}>
        <div className="lists-page-body surface-card min-h-0 flex-1 divide-y divide-[#F0EBE3] overflow-hidden">
          <SharedListSection
            sectionId="groceries"
            title="Groceries"
            kind="shopping"
            items={shopping}
            canEdit={canEdit}
            emptyMessage="Nothing yet — plan dinner or run a walk-through to add items."
            addLabel="Add groceries"
          />
          <SharedListSection
            sectionId="todo"
            title="To do today"
            kind="todo"
            items={todos}
            canEdit={canEdit}
            emptyMessage="Nothing on the list yet — add a task your household can see."
            addLabel="Add a task for today"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <p className="lists-page-back text-center text-sm text-[#5C6478]">
          <Link href="/dashboard" className="font-medium text-primary-900 hover:underline">
            ← Back to Today
          </Link>
        </p>
      </ScrollReveal>
    </div>
  )
}
