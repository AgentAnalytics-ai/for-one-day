'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import type { VaultItem, FamilyRole } from '@/lib/types/family'
import { canAccessVaultItem } from '@/lib/types/family'

/**
 * 🔒 Age-Gated Vault Component
 * Professional conditional access system for family vault items
 */

interface AgeGatedVaultProps {
  vaultItems: VaultItem[]
  userRole: FamilyRole
  userAge?: number
  familyContext: {
    isParent: boolean
    canOverride: boolean
  }
}

export function AgeGatedVault({ 
  vaultItems, 
  userRole, 
  userAge,
  familyContext 
}: AgeGatedVaultProps) {
  const [showLockedItems, setShowLockedItems] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Categorize vault items by access level
  const categorizedItems = useMemo(() => {
    const accessible: VaultItem[] = []
    const ageLocked: VaultItem[] = []
    const roleLocked: VaultItem[] = []
    const futureLocked: VaultItem[] = []

    vaultItems.forEach(item => {
      // Check if user can access this item
      const hasAccess = canAccessVaultItem(item, userRole, userAge)
      
      if (hasAccess || familyContext.canOverride) {
        accessible.push(item)
      } else {
        // Determine why it's locked
        if (item.age_gate && userAge && userAge < item.age_gate) {
          ageLocked.push(item)
        } else if (item.release_date && new Date(item.release_date) > new Date()) {
          futureLocked.push(item)
        } else {
          roleLocked.push(item)
        }
      }
    })

    return { accessible, ageLocked, roleLocked, futureLocked }
  }, [vaultItems, userRole, userAge, familyContext])

  const categories = [
    { id: 'all', label: 'Available Now', count: categorizedItems.accessible.length },
    { id: 'age_locked', label: 'Age Restricted', count: categorizedItems.ageLocked.length },
    { id: 'future_locked', label: 'Future Release', count: categorizedItems.futureLocked.length },
    { id: 'role_locked', label: 'Role Restricted', count: categorizedItems.roleLocked.length }
  ]

  const getItemsForCategory = (categoryId: string): VaultItem[] => {
    switch (categoryId) {
      case 'all': return categorizedItems.accessible
      case 'age_locked': return categorizedItems.ageLocked
      case 'future_locked': return categorizedItems.futureLocked
      case 'role_locked': return categorizedItems.roleLocked
      default: return categorizedItems.accessible
    }
  }

  const currentItems = getItemsForCategory(selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.label}
              {category.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map(item => (
          <VaultItemCard
            key={item.id}
            item={item}
            userRole={userRole}
            userAge={userAge}
            isLocked={selectedCategory !== 'all'}
            canOverride={familyContext.canOverride}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentItems.length === 0 && (
        <EmptyVaultState category={selectedCategory} userRole={userRole} />
      )}

      {/* Parent Override Toggle */}
      {familyContext.canOverride && (categorizedItems.ageLocked.length > 0 || categorizedItems.roleLocked.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-900">Parent Override Available</h4>
              <p className="text-sm text-amber-700 mt-1">
                As a parent, you can view restricted items to manage family content appropriately.
              </p>
              <button
                onClick={() => setShowLockedItems(!showLockedItems)}
                className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                {showLockedItems ? 'Hide' : 'Show'} Restricted Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VAULT ITEM CARD COMPONENT
// ============================================================================

interface VaultItemCardProps {
  item: VaultItem
  userRole: FamilyRole
  userAge?: number
  isLocked: boolean
  canOverride: boolean
}

function VaultItemCard({ item, userRole, userAge, isLocked, canOverride }: VaultItemCardProps) {
  const [showOverride, setShowOverride] = useState(false)

  const lockReason = useMemo(() => {
    if (item.age_gate && userAge && userAge < item.age_gate) {
      return {
        type: 'age',
        message: `Available when you turn ${item.age_gate}`,
        icon: <CalendarIcon />
      }
    }
    
    if (item.release_date && new Date(item.release_date) > new Date()) {
      return {
        type: 'date',
        message: `Available on ${format(new Date(item.release_date), 'MMM d, yyyy')}`,
        icon: <ClockIcon />
      }
    }
    
    if (!canAccessVaultItem(item, userRole, userAge)) {
      return {
        type: 'role',
        message: 'Access restricted by role',
        icon: <LockIcon />
      }
    }
    
    return null
  }, [item, userRole, userAge])

  if (isLocked && !canOverride) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          {lockReason?.icon || <LockIcon />}
        </div>
        <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {lockReason?.message || 'Access restricted'}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
          <LockIcon className="w-3 h-3" />
          Locked
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${
      isLocked ? 'border-amber-200 bg-amber-50' : 'border-gray-200'
    }`}>
      {/* Override Warning */}
      {isLocked && canOverride && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 rounded-t-xl">
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Parent Override Active
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Item Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getKindStyles(item.kind).bg}`}>
              {getKindIcon(item.kind)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{item.kind}</p>
            </div>
          </div>
          
          {item.age_gate && (
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {item.age_gate}+
            </div>
          )}
        </div>

        {/* Item Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Item Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
          <div className="flex items-center gap-2">
            <span className="capitalize">{item.visibility}</span>
            {item.encrypted && (
              <div className="flex items-center gap-1">
                <LockIcon className="w-3 h-3" />
                Encrypted
              </div>
            )}
          </div>
        </div>

        {/* Access Button */}
        <div className="mt-4">
          {isLocked && !showOverride ? (
            <button
              onClick={() => setShowOverride(true)}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {lockReason?.message || 'Restricted Access'}
            </button>
          ) : (
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Open Item
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyVaultState({ category, userRole }: { category: string, userRole: FamilyRole }) {
  const getEmptyMessage = () => {
    switch (category) {
      case 'age_locked':
        return {
          title: 'No age-restricted items',
          message: 'Items with age gates will appear here when added to the vault.',
          icon: <CalendarIcon />
        }
      case 'future_locked':
        return {
          title: 'No future releases',
          message: 'Items scheduled for future release will appear here.',
          icon: <ClockIcon />
        }
      case 'role_locked':
        return {
          title: 'No role-restricted items',
          message: 'Items restricted to other family roles will appear here.',
          icon: <UsersIcon />
        }
      default:
        return {
          title: 'No vault items yet',
          message: userRole === 'child_minor' 
            ? 'Your family hasn\'t added any items for you yet.' 
            : 'Start building your family legacy by adding your first item.',
          icon: <PlusIcon />
        }
    }
  }

  const emptyState = getEmptyMessage()

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {emptyState.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{emptyState.message}</p>
    </div>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getKindStyles(kind: string) {
  const styles = {
    letter: { bg: 'bg-blue-100', text: 'text-blue-600' },
    video: { bg: 'bg-red-100', text: 'text-red-600' },
    audio: { bg: 'bg-green-100', text: 'text-green-600' },
    document: { bg: 'bg-purple-100', text: 'text-purple-600' },
    photo: { bg: 'bg-yellow-100', text: 'text-yellow-600' }
  }
  
  return styles[kind as keyof typeof styles] || styles.document
}

function getKindIcon(kind: string) {
  const iconClass = `w-5 h-5 ${getKindStyles(kind).text}`
  
  switch (kind) {
    case 'letter':
      return <DocumentIcon className={iconClass} />
    case 'video':
      return <VideoIcon className={iconClass} />
    case 'audio':
      return <AudioIcon className={iconClass} />
    case 'document':
      return <DocumentIcon className={iconClass} />
    case 'photo':
      return <PhotoIcon className={iconClass} />
    default:
      return <DocumentIcon className={iconClass} />
  }
}

// ============================================================================
// ICONS
// ============================================================================

function LockIcon({ className = "w-5 h-5 text-gray-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function CalendarIcon({ className = "w-5 h-5 text-gray-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ClockIcon({ className = "w-5 h-5 text-gray-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function UsersIcon({ className = "w-5 h-5 text-gray-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}

function PlusIcon({ className = "w-5 h-5 text-gray-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
}

function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function VideoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function AudioIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function PhotoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
