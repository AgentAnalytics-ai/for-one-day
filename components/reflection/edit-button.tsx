'use client'

import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'

/**
 * ✏️ Edit Button Component
 * Simple button to toggle edit mode for reflections
 */
export function EditButton() {
  const router = useRouter()

  const handleEdit = () => {
    router.push('/reflection?edit=true')
  }

  return (
    <button
      onClick={handleEdit}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
      title="Edit reflection"
    >
      <Edit2 className="w-4 h-4 text-green-700" />
      <span className="text-sm font-medium text-green-700">Edit</span>
    </button>
  )
}

