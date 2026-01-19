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
import Image from 'next/image'
import { ShareLegacyNoteModal } from '@/components/vault/share-legacy-note-modal'

const AdvancedCreateLegacyNoteModal = dynamic(
  () => import('@/components/ui/create-legacy-note-modal').then(mod => ({ default: mod.CreateLegacyNoteModal })),
  { ssr: false }
)

interface Attachment {
  storage_path: string
  url?: string
  type: 'image' | 'video'
  mime_type: string
  file_size_bytes: number
  filename?: string
}

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
    attachments?: Attachment[]
    // Allow for backward compatibility with other metadata structures
    recipient?: string
    occasion?: string
    template_id?: string
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
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [itemToShare, setItemToShare] = useState<VaultItem | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])
  const [usage, setUsage] = useState<{ current: number; limit: number }>({ current: 0, limit: -1 })
  const [statsLoading, setStatsLoading] = useState(true)

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
      setStatsLoading(true)
      Promise.all([
        loadVaultItems(),
        loadTemplates(),
        loadUsage()
      ]).finally(() => {
        setStatsLoading(false)
      })
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
    } finally {
      setStatsLoading(false)
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
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full mb-4 shadow-sm border border-primary-200/50">
            <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="font-semibold text-primary-900">Legacy Vault</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
            Preserve Your Legacy
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Your wisdom, love, and life lessons for generations to come
          </p>
        </div>

        {/* Stats - Fixed height to prevent layout shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumCard className="p-6 text-center min-h-[120px] flex flex-col justify-center border-2 border-primary-200">
            <div className="text-4xl font-bold text-primary-700 mb-2 min-h-[40px] flex items-center justify-center">
              {statsLoading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                usage.limit === -1 ? (usage.current || 0) : `${usage.current || 0}/${usage.limit}`
              )}
            </div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Legacy Notes</div>
          </PremiumCard>
          <PremiumCard className="p-6 text-center min-h-[120px] flex flex-col justify-center border-2 border-primary-200">
            <div className="text-4xl font-bold text-primary-700 mb-2 min-h-[40px] flex items-center justify-center">
              {statsLoading ? (
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                templates?.length || 0
              )}
            </div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Available Templates</div>
          </PremiumCard>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {usage.limit !== -1 && usage.current >= usage.limit - 1 && (
          <PremiumCard className="p-8 bg-gradient-to-br from-accent-50 via-accent-50/50 to-accent-100 border-2 border-accent-300 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent-200 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">
                  You&apos;ve used {usage.current} of {usage.limit} free letters
                </h3>
                <p className="text-gray-700 mb-6 font-medium leading-relaxed">
                  What happens if you need to write more? Upgrade to Pro for unlimited letters, 
                  scheduled delivery, and emergency access features.
                </p>
                <Link href="/upgrade">
                  <PremiumButton size="lg" className="shadow-xl hover:shadow-2xl">
                    Upgrade to Pro - $9.99/month
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Create New Note */}
        <PremiumCard className="p-8 border-2 border-primary-200" data-tour="create">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Create a Legacy Note
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-medium">
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200 font-medium text-gray-900 shadow-sm hover:border-primary-300"
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
            <PremiumCard className="p-12 text-center bg-gradient-to-br from-primary-50 via-primary-50/50 to-secondary-50 border-2 border-primary-200">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-primary-200">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>&quot;If I Die Tomorrow&quot;</strong> - Your most important values</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>&quot;Wedding Day Letter&quot;</strong> - For their biggest day</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                {usage.limit === -1 ? 'Unlimited letters with Pro' : `${usage.limit - usage.current} free letters remaining`}
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
                      <PremiumButton 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          setItemToShare(item)
                          setShareModalOpen(true)
                        }}
                      >
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
          editingItem={selectedLetter || null}
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

      {/* Share Modal */}
      {shareModalOpen && itemToShare && (
        <ShareLegacyNoteModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setItemToShare(null)
          }}
          vaultItem={itemToShare}
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
  const [attachments, setAttachments] = useState<Array<Attachment & { signedUrl?: string }>>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)

  useEffect(() => {
    if (isOpen && letter.metadata?.attachments && letter.metadata.attachments.length > 0) {
      setLoadingAttachments(true)
      
      // Generate signed URLs for attachments
      async function loadSignedUrls() {
        const supabase = createClient()
        const attachmentPromises = letter.metadata!.attachments!.map(async (attachment: Attachment) => {
          try {
            const { data } = await supabase.storage
              .from('vault')
              .createSignedUrl(attachment.storage_path, 3600) // 1 hour expiry
            const signedUrl = data?.signedUrl || undefined
            if (!signedUrl) return null
            return {
              ...attachment,
              signedUrl
            }
          } catch (error) {
            console.error('Error generating signed URL:', error)
            return null
          }
        })

        const attachmentsWithUrls = await Promise.all(attachmentPromises)
        const validAttachments = attachmentsWithUrls.filter((a): a is Attachment & { signedUrl: string } => a !== null && !!a.signedUrl)
        setAttachments(validAttachments)
        setLoadingAttachments(false)
      }

      loadSignedUrls()
    } else {
      setAttachments([])
    }
  }, [isOpen, letter])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-primary-200 animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {letter.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200 focus:ring-4 focus:ring-primary-300 focus:outline-none"
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
                <p className="text-gray-900 capitalize">
                  {letter.metadata.recipient_name}
                </p>
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

            {/* Attachments Gallery */}
            {attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.storage_path || index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                    >
                      {attachment.type === 'image' && attachment.signedUrl ? (
                        <img
                          src={attachment.signedUrl}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : attachment.type === 'video' && attachment.signedUrl ? (
                        <video
                          src={attachment.signedUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-500">Loading...</span>
                        </div>
                      )}
                      
                      {/* Video badge */}
                      {attachment.type === 'video' && (
                        <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-gray-600">
                {new Date(letter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary-700 text-white rounded-xl hover:bg-primary-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-primary-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
