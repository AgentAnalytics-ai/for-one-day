import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonMemoriesTimeline } from '@/components/memories/person-memories-timeline'

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
      <div>
        <Link href="/memories" className="text-sm text-blue-800 hover:underline mb-4 inline-block">
          ← All memories
        </Link>
        <h1 className="text-3xl font-serif font-light text-gray-900">{person.display_name}</h1>
        {person.relationship && <p className="text-slate-600 mt-1">{person.relationship}</p>}
      </div>
      <PersonMemoriesTimeline personId={personId} displayName={person.display_name} />
    </div>
  )
}
