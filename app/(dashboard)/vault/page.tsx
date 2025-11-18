'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ToastContainer } from '@/components/ui/toast'
import { toast } from '@/lib/toast'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ProfessionalTour } from '@/components/onboarding/professional-tour'

const AdvancedCreateLegacyNoteModal = dynamic(
  () => import('@/components/ui/create-legacy-note-modal').then(mod => ({ default: mod.CreateLegacyNoteModal })),
  { ssr: false }
)

interface VaultItem {
  id: string
  title: string
  description: string
  kind: string
  metadata?: {
    content?: string
    template_type?: string
    recipient_name?: string
    recipient_email?: string
    is_shared?: boolean
  }
  created_at: string
}

interface LegacyTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  placeholders: string[]
}

interface LegacyApiTemplate {
  id: string
  title: string
  description: string
  category: string
  template: string
  tags?: string[]
}

export default function VaultPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [templates, setTemplates] = useState<LegacyTemplate[]>([])
  const [selectedTemplateOption, setSelectedTemplateOption] = useState<LegacyTemplate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<LegacyTemplate | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<VaultItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])
  const [usage, setUsage] = useState<{ current: number; limit: number }>({ current: 0, limit: -1 })

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Set up toast subscription
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadVaultItems()
      loadTemplates()
      loadUsage()
    }
  }, [user])

  const loadVaultItems = async () => {
    try {
      const response = await fetch('/api/vault/items')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVaultItems(data.items)
        }
      }
    } catch (error) {
      console.error('Error loading vault items:', error)
      toast.error('Failed to load legacy notes')
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/legacy-templates')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const flattened = Object.values(data.templates || {}).flat() as LegacyApiTemplate[]
          const mapped: LegacyTemplate[] = flattened.map((t: LegacyApiTemplate) => ({
            id: t.id,
            name: t.title,
            description: t.description,
            category: t.category,
            template_content: t.template,
            placeholders: Array.isArray(t.tags) ? t.tags : []
          }))
          setTemplates(mapped)
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    }
  }

  const loadUsage = async () => {
    try {
      const response = await fetch('/api/usage/legacy')
      if (response.ok) {
        const data = await response.json()
        if (data.success) setUsage({ current: data.current, limit: data.limit })
      }
    } catch (error) {
      console.error('Error loading usage:', error)
    }
  }

  const handleCreateFromTemplate = (template: LegacyTemplate) => {
    setSelectedTemplate(template)
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    setSelectedTemplate(null)
    loadVaultItems()
    loadUsage() // Reload usage counter
    toast.success('Legacy note created successfully!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this legacy note?')) return

    const supabase = createClient()
    const { error } = await supabase.from('vault_items').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete note', error.message)
    } else {
      toast.success('Note deleted successfully')
      loadVaultItems()
      loadUsage() // Reload usage counter
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your legacy vault...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <ProfessionalTour />
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
            Legacy Vault
          </h1>
          <p className="text-gray-600">
            Preserve your wisdom, love, and life lessons for your family
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {usage.limit === -1 ? (usage.current || 0) : `${usage.current || 0}/${usage.limit}`}
            </div>
            <div className="text-sm text-gray-600">Legacy Notes</div>
          </PremiumCard>
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {vaultItems?.filter(item => item.metadata?.is_shared).length || 0}
            </div>
            <div className="text-sm text-gray-600">Shared with Family</div>
          </PremiumCard>
          <PremiumCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {templates?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Available Templates</div>
          </PremiumCard>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {usage.limit !== -1 && usage.current >= usage.limit - 1 && (
          <PremiumCard className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  You&apos;ve used {usage.current} of {usage.limit} free letters
                </h3>
                <p className="text-gray-700 mb-4">
                  What happens if you need to write more? Upgrade to Pro for unlimited letters, 
                  scheduled delivery, and emergency access features.
                </p>
                <Link href="/upgrade">
                  <PremiumButton className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    Upgrade to Pro - $9.99/month
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Create New Note */}
        <PremiumCard className="p-8" data-tour="create">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Create a Legacy Note
            </h2>
            <p className="text-gray-600 mb-6">
              Choose from our professional templates or create your own
            </p>
            <PremiumButton
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="px-8"
              disabled={usage.limit !== -1 && usage.current >= usage.limit}
            >
              {usage.limit !== -1 && usage.current >= usage.limit ? 'Limit Reached' : 'Create New Note'}
            </PremiumButton>
          </div>
        </PremiumCard>

        {/* Templates */}
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Templates</h2>
          {templates && templates.length > 0 ? (
            <PremiumCard className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose a template</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={selectedTemplateOption?.id || ''}
                    onChange={(e) => {
                      const t = templates.find(t => t.id === e.target.value) || null
                      setSelectedTemplateOption(t)
                    }}
                  >
                    <option value="">Select a template...</option>
                    {templates
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.category ? `• ${t.category}` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedTemplateOption && (
                  <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{selectedTemplateOption.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{selectedTemplateOption.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{selectedTemplateOption.description}</p>
                    <div className="flex gap-3">
                      <PremiumButton
                        variant="secondary"
                        onClick={() => handleCreateFromTemplate(selectedTemplateOption)}
                      >
                        Use Template
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        onClick={() => {
                          setSelectedTemplate(selectedTemplateOption)
                          setShowCreateModal(true)
                        }}
                      >
                        Preview & Edit
                      </PremiumButton>
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading templates...</p>
            </div>
          )}
        </div>

        {/* Legacy Notes */}
        <div data-tour="vault">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Your Legacy Notes</h2>
          {vaultItems && vaultItems.length === 0 ? (
            <PremiumCard className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">
                Your Family&apos;s Future Starts Here
              </h3>
              
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                Imagine your daughter on her wedding day, reading a letter you wrote today. 
                Or your son facing a tough decision, guided by wisdom you shared years ago.
              </p>
              
              <div className="bg-white/80 backdrop-blur rounded-lg p-6 mb-8 max-w-xl mx-auto">
                <p className="text-gray-800 font-medium mb-3">Most powerful first letters:</p>
                <ul className="text-left text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>&quot;If I Die Tomorrow&quot;</strong> - Your most important values</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>&quot;Wedding Day Letter&quot;</strong> - For their biggest day</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>&quot;Life Lessons&quot;</strong> - Wisdom you wish you knew earlier</span>
                  </li>
                </ul>
              </div>
              
              <PremiumButton 
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                data-tour="create"
              >
                Write Your First Letter (5 minutes)
              </PremiumButton>
              
              <p className="text-sm text-gray-500 mt-4">
                {usage.limit === -1 ? '✨ Unlimited letters with Pro' : `${usage.limit - usage.current} free letters remaining`}
              </p>
            </PremiumCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaultItems?.map((item) => (
                <PremiumCard key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                    {item.metadata?.is_shared && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Shared
                      </span>
                    )}
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  {item.metadata?.recipient_name && (
                    <p className="text-sm text-gray-500 mb-4">
                      For: {item.metadata.recipient_name}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <PremiumButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        // Open view modal
                        setSelectedLetter(item)
                        setIsModalOpen(true)
                      }}
                    >
                      View
                    </PremiumButton>
                    <PremiumButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        // Open edit modal with item data
                        setSelectedLetter(item)
                        setSelectedTemplate(null) // Clear template when editing
                        setShowCreateModal(true)
                      }}
                    >
                      Edit
                    </PremiumButton>
                    {!item.metadata?.is_shared && (
                      <PremiumButton size="sm" variant="secondary">
                        Share
                      </PremiumButton>
                    )}
                    <PremiumButton 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </PremiumButton>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <AdvancedCreateLegacyNoteModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedTemplate(null)
            setSelectedLetter(null)
          }}
          onSuccess={handleCreateSuccess}
          selectedTemplate={selectedTemplate}
          editingItem={selectedLetter}
        />
      )}

      {/* View Modal */}
      {isModalOpen && selectedLetter && (
        <LetterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          letter={selectedLetter}
        />
      )}
    </>
  )
}

// Letter View Modal Component
function LetterModal({ 
  isOpen, 
  onClose, 
  letter 
}: { 
  isOpen: boolean
  onClose: () => void
  letter: VaultItem
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">
              {letter.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {letter.metadata?.recipient_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  For
                </label>
                <p className="text-gray-900">{letter.metadata.recipient_name}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {letter.metadata?.content || letter.description}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-gray-600">
                {new Date(letter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
