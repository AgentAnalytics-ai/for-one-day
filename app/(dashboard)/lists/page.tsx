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
    <div className="mx-auto max-w-3xl space-y-8">
      <ScrollReveal>
        <PageHeader
          eyebrow={<span className="text-primary-900">Lists</span>}
          title="To do & shopping"
          subtitle={
            canEdit
              ? 'Shared with everyone in your home — check off from the wall or your phone.'
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
        <div className="surface-card divide-y divide-[#F0EBE3]">
          <SharedListSection
            title="To do today"
            kind="todo"
            items={todos}
            canEdit={canEdit}
            emptyMessage="Nothing on the list yet — add a task your household can see."
            addLabel="Add a task for today"
          />
          <SharedListSection
            title="Shopping"
            kind="shopping"
            items={shopping}
            canEdit={canEdit}
            emptyMessage="Groceries for tonight's dinner show up here."
            addLabel="Add to shopping list"
          />
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
