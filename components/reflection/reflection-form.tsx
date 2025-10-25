'use client'

import { useState } from 'react'
import { PremiumButton } from '@/components/ui/premium-button'
import { toast } from '@/lib/toast'

interface ReflectionFormProps {
  question: string
  date: string
}

export function ReflectionForm({ question, date }: ReflectionFormProps) {
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reflection.trim()) {
      toast.error('Please write your reflection before saving')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/reflection/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflection: reflection.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Reflection saved successfully!')
        // Refresh the page to show the completed state
        window.location.reload()
      } else {
        toast.error(data.error || 'Failed to save reflection')
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
      toast.error('Failed to save reflection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-2">
          Your Reflection
        </label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts, gratitude, or insights from today..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={6}
          required
        />
      </div>

      <div className="flex justify-center">
        <PremiumButton
          type="submit"
          disabled={saving || !reflection.trim()}
          className="px-8 py-3"
        >
          {saving ? 'Saving...' : 'Save Reflection'}
        </PremiumButton>
      </div>
    </form>
  )
}
