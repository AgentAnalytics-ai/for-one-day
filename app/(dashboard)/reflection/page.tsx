import { redirect } from 'next/navigation'

/**
 * Legacy route: daily reflection / verse flow removed in favor of Memories.
 * Old bookmarks still work.
 */
export default function ReflectionPageRedirect() {
  redirect('/memories')
}
