import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { getUserPermissions } from '@/lib/types/family'
import type { FamilyMember, LegalDocument } from '@/lib/types/family'

/**
 * ⚖️ Legal Document Management
 * Professional estate document organization and tracking
 */
export default async function LegalDocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get family context and verify legal authority
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!familyMember) {
    redirect('/dashboard?error=' + encodeURIComponent('Family membership required'))
  }

  const permissions = getUserPermissions(familyMember as FamilyMember)
  const familyId = familyMember.family_id

  // Check access permissions
  if (!permissions.legal_authority && !permissions.family.admin) {
    redirect('/dashboard?error=' + encodeURIComponent('Legal document access not authorized'))
  }

  // Fetch family information
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single()

  // Fetch legal documents
  const { data: legalDocuments } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  // Group documents by type
  const documentsByType = legalDocuments?.reduce((acc, doc) => {
    const type = doc.document_type
    if (!acc[type]) acc[type] = []
    acc[type].push(doc)
    return acc
  }, {} as Record<string, LegalDocument[]>) || {}

  const documentTypes = [
    { id: 'will', label: 'Wills & Testaments', icon: '📜', description: 'Last will and testament documents' },
    { id: 'trust', label: 'Trust Documents', icon: '🏛️', description: 'Trust agreements and amendments' },
    { id: 'power_of_attorney', label: 'Power of Attorney', icon: '⚖️', description: 'Legal authority documents' },
    { id: 'medical_directive', label: 'Medical Directives', icon: '🏥', description: 'Healthcare and medical decisions' },
    { id: 'guardianship', label: 'Guardianship', icon: '👨‍👩‍👧‍👦', description: 'Child and dependent care documents' },
    { id: 'insurance_policy', label: 'Insurance Policies', icon: '🛡️', description: 'Life and disability insurance' },
    { id: 'beneficiary_info', label: 'Beneficiary Information', icon: '👥', description: 'Beneficiary designations and updates' },
    { id: 'other', label: 'Other Legal Documents', icon: '📋', description: 'Additional legal documents' }
  ]

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-gray-900">
              Legal Documents
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Estate planning and legal document management for {family?.name}
            </p>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/legal/dashboard"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Legal Dashboard
            </Link>
            <Link
              href="/legal/documents/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Document
            </Link>
          </div>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DocumentStatCard
          title="Total Documents"
          value={legalDocuments?.length || 0}
          description="All legal documents"
          color="purple"
        />
        
        <DocumentStatCard
          title="Executed"
          value={legalDocuments?.filter(doc => doc.legal_status === 'executed').length || 0}
          description="Legally binding"
          color="green"
        />
        
        <DocumentStatCard
          title="Pending"
          value={legalDocuments?.filter(doc => doc.legal_status === 'draft').length || 0}
          description="Awaiting execution"
          color="orange"
        />
        
        <DocumentStatCard
          title="Need Review"
          value={legalDocuments?.filter(doc => 
            doc.review_date && new Date(doc.review_date) <= new Date()
          ).length || 0}
          description="Due for review"
          color="red"
        />
      </div>

      {/* Document Categories */}
      <div className="space-y-8">
        {documentTypes.map(type => {
          const documents = documentsByType[type.id] || []
          
          return (
            <div key={type.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h2 className="text-xl font-serif font-medium text-gray-900">
                        {type.label}
                      </h2>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {documents.length} documents
                    </span>
                    <Link
                      href={`/legal/documents/new?type=${type.id}`}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Add {type.label}
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(document => (
                      <LegalDocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">{type.icon}</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {type.label.toLowerCase()} yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add your first {type.label.toLowerCase()} to start organizing your estate documents.
                    </p>
                    <Link
                      href={`/legal/documents/new?type=${type.id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add {type.label}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Estate Planning Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-serif font-medium text-blue-900 mb-4">
          Estate Planning Checklist
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistItem
            label="Last Will & Testament"
            completed={documentsByType.will?.some(doc => doc.legal_status === 'executed') || false}
            description="Primary estate distribution document"
          />
          
          <ChecklistItem
            label="Power of Attorney"
            completed={documentsByType.power_of_attorney?.some(doc => doc.legal_status === 'executed') || false}
            description="Legal authority for financial decisions"
          />
          
          <ChecklistItem
            label="Medical Directive"
            completed={documentsByType.medical_directive?.some(doc => doc.legal_status === 'executed') || false}
            description="Healthcare decision authority"
          />
          
          <ChecklistItem
            label="Trust Documents"
            completed={documentsByType.trust?.some(doc => doc.legal_status === 'executed') || false}
            description="Asset protection and distribution"
          />
          
          <ChecklistItem
            label="Life Insurance"
            completed={documentsByType.insurance_policy?.length > 0 || false}
            description="Financial protection for beneficiaries"
          />
          
          <ChecklistItem
            label="Beneficiary Designations"
            completed={documentsByType.beneficiary_info?.length > 0 || false}
            description="Updated beneficiary information"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

function DocumentStatCard({ 
  title, 
  value, 
  description, 
  color 
}: {
  title: string
  value: number
  description: string
  color: 'purple' | 'green' | 'orange' | 'red'
}) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }
  
  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="font-medium text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function LegalDocumentCard({ document }: { document: LegalDocument }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    executed: 'bg-green-100 text-green-800',
    notarized: 'bg-blue-100 text-blue-800',
    filed: 'bg-purple-100 text-purple-800',
    revoked: 'bg-red-100 text-red-800'
  }
  
  const isOverdue = document.review_date && new Date(document.review_date) <= new Date()
  
  return (
    <Link 
      href={`/legal/documents/${document.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 line-clamp-2">{document.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.legal_status]}`}>
            {document.legal_status}
          </span>
        </div>
        
        {/* Description */}
        {document.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
        )}
        
        {/* Metadata */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            Created {format(new Date(document.created_at), 'MMM d, yyyy')}
          </p>
          
          {document.execution_date && (
            <p className="text-xs text-gray-500">
              Executed {format(new Date(document.execution_date), 'MMM d, yyyy')}
            </p>
          )}
          
          {document.review_date && (
            <p className={`text-xs font-medium ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              Review {isOverdue ? 'overdue' : 'due'}: {format(new Date(document.review_date), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        
        {/* Alerts */}
        <div className="flex flex-wrap gap-1">
          {document.requires_notarization && document.legal_status === 'draft' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Notarization Required
            </span>
          )}
          
          {document.witness_required && document.legal_status === 'draft' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Witnesses Required
            </span>
          )}
          
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review Overdue
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ChecklistItem({ 
  label, 
  completed, 
  description 
}: { 
  label: string
  completed: boolean
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
        completed 
          ? 'border-green-500 bg-green-500' 
          : 'border-gray-300'
      }`}>
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      <div className="flex-1">
        <p className={`font-medium ${completed ? 'text-green-900' : 'text-blue-900'}`}>
          {label}
        </p>
        <p className="text-sm text-blue-700">{description}</p>
      </div>
    </div>
  )
}
