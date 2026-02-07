'use client'

import { useState } from 'react'
import { PremiumButton } from '@/components/ui/premium-button'
import { toast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'

interface SaveAsLegacyNoteProps {
  reflectionId: string
  reflectionText: string
  reflectionDate: string
}

export function SaveAsLegacyNote({ reflectionId, reflectionText, reflectionDate }: SaveAsLegacyNoteProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const router = useRouter()

  const handleConvert = async () => {
    if (!recipientName.trim()) {
      toast.error('Please enter a recipient name')
      return
    }

    setIsConverting(true)

    try {
      const response = await fetch('/api/reflection/convert-to-legacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflectionId,
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.upgradeRequired) {
          toast.error('Upgrade to Pro for unlimited legacy notes')
          router.push('/upgrade')
          return
        }
        throw new Error(data.error || 'Failed to convert reflection')
      }

      toast.success('Reflection saved as legacy note!')
      setShowModal(false)
      router.push('/vault')
    } catch (error) {
      console.error('Error converting reflection:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to convert reflection')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <>
      {/* Quick Convert Button */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-700" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-primary-900 mb-1">
              Preserve This Reflection
            </h4>
            <p className="text-xs text-primary-700 mb-3">
              This reflection contains wisdom worth preserving. Save it as a legacy note for future generations.
            </p>
            <PremiumButton
              size="sm"
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto"
            >
              <Lock className="w-4 h-4 mr-2" />
              Save as Legacy Note
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-primary-200 animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Save as Legacy Note
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is this for? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., My Daughter, My Son, My Family"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For scheduled delivery (Pro feature)
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  <p className="text-sm text-gray-800 italic line-clamp-3">
                    &ldquo;{reflectionText}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    From {new Date(reflectionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <PremiumButton
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  onClick={handleConvert}
                  disabled={isConverting || !recipientName.trim()}
                  className="flex-1"
                >
                  {isConverting ? 'Saving...' : 'Save Legacy Note'}
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
