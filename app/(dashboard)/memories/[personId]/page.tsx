import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonMemoriesTimeline } from '@/components/memories/person-memories-timeline'
import { PageHeader } from '@/components/ui/page-header'

export default async function PersonMemoriesPage({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const { personId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: person, error } = await supabase
    .from('memory_people')
    .select('id, display_name, relationship')
    .eq('id', personId)
    .eq('user_id', user.id)
    .single()

  if (error || !person) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        backHref="/memories"
        backLabel="← All memories"
        eyebrow="Person timeline"
        title={person.display_name}
        subtitle={person.relationship || undefined}
      />
      <PersonMemoriesTimeline personId={personId} displayName={person.display_name} />
    </div>
  )
}
