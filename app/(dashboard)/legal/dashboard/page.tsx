import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { getUserPermissions } from '@/lib/types/family'
import type { FamilyMember, LegalDocument } from '@/lib/types/family'

/**
 * ⚖️ Trust Executor Legal Dashboard
 * Professional legal document management and estate oversight
 */
export default async function LegalDashboardPage() {
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

  if (!familyMember || familyMember.role !== 'trust_executor' || !familyMember.legal_authority) {
    redirect('/dashboard?error=' + encodeURIComponent('Access denied: Legal authority required'))
  }

  const permissions = getUserPermissions(familyMember as FamilyMember)
  const familyId = familyMember.family_id

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

  // Fetch vault items with legal visibility
  const { data: legalVaultItems } = await supabase
    .from('vault_items')
    .select('*')
    .eq('family_id', familyId)
    .eq('visibility', 'legal')
    .order('created_at', { ascending: false })

  // Fetch emergency access logs
  const { data: emergencyLogs } = await supabase
    .from('emergency_access_logs')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(5)

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-gray-900">
              Legal Dashboard
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Estate management for {family?.name}
            </p>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Trust Executor
            </div>
            <Link
              href="/legal/documents/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Legal Document
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LegalStatCard
          title="Legal Documents"
          value={legalDocuments?.length || 0}
          description="Estate documents managed"
          icon={<DocumentIcon />}
          color="purple"
        />
        
        <LegalStatCard
          title="Executed Documents"
          value={legalDocuments?.filter(doc => doc.legal_status === 'executed').length || 0}
          description="Legally binding documents"
          icon={<CheckCircleIcon />}
          color="green"
        />
        
        <LegalStatCard
          title="Pending Review"
          value={legalDocuments?.filter(doc => doc.legal_status === 'draft').length || 0}
          description="Documents needing attention"
          icon={<ClockIcon />}
          color="orange"
        />
        
        <LegalStatCard
          title="Emergency Access"
          value={emergencyLogs?.length || 0}
          description="Recent emergency events"
          icon={<ExclamationIcon />}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Legal Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-medium text-gray-900">
                  Legal Documents
                </h2>
                <Link
                  href="/legal/documents"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {legalDocuments && legalDocuments.length > 0 ? (
                <div className="space-y-4">
                  {legalDocuments.slice(0, 5).map((doc) => (
                    <LegalDocumentCard key={doc.id} document={doc as LegalDocument} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No legal documents yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding the family&apos;s legal documents for proper estate management.
                  </p>
                  <Link
                    href="/legal/documents/new"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add First Document
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Legal Vault Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-serif font-medium text-gray-900">
                Legal Vault Items
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Documents marked for legal/executor access only
              </p>
            </div>
            
            <div className="p-6">
              {legalVaultItems && legalVaultItems.length > 0 ? (
                <div className="space-y-3">
                  {legalVaultItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DocumentIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No legal vault items found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-serif font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <Link
                href="/legal/documents/new"
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 text-gray-400" />
                <span>Add Legal Document</span>
              </Link>
              
              <Link
                href="/legal/emergency/access"
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExclamationIcon className="w-5 h-5 text-gray-400" />
                <span>Emergency Access</span>
              </Link>
              
              <Link
                href="/legal/reports"
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ChartIcon className="w-5 h-5 text-gray-400" />
                <span>Generate Report</span>
              </Link>
              
              <Link
                href="/family/settings"
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UsersIcon className="w-5 h-5 text-gray-400" />
                <span>Family Overview</span>
              </Link>
            </div>
          </div>

          {/* Recent Emergency Access */}
          {emergencyLogs && emergencyLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-serif font-medium text-gray-900 mb-4">
                Recent Emergency Access
              </h3>
              
              <div className="space-y-3">
                {emergencyLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationIcon className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-900">
                          {log.emergency_type} Emergency
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Compliance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-serif font-medium text-gray-900 mb-4">
              Compliance Status
            </h3>
            
            <div className="space-y-3">
              <ComplianceItem
                label="Will & Testament"
                status={legalDocuments?.some(doc => doc.document_type === 'will' && doc.legal_status === 'executed') ? 'complete' : 'pending'}
              />
              
              <ComplianceItem
                label="Power of Attorney"
                status={legalDocuments?.some(doc => doc.document_type === 'power_of_attorney' && doc.legal_status === 'executed') ? 'complete' : 'pending'}
              />
              
              <ComplianceItem
                label="Medical Directive"
                status={legalDocuments?.some(doc => doc.document_type === 'medical_directive' && doc.legal_status === 'executed') ? 'complete' : 'pending'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

function LegalStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  color 
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color: 'purple' | 'green' | 'orange' | 'red'
}) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600', 
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
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
  
  return (
    <Link 
      href={`/legal/documents/${document.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{document.title}</h4>
          <p className="text-sm text-gray-600 capitalize mb-2">
            {document.document_type.replace('_', ' ')}
          </p>
          <p className="text-xs text-gray-500">
            Created {format(new Date(document.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.legal_status]}`}>
            {document.legal_status}
          </span>
          
          {document.requires_notarization && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <ExclamationIcon className="w-3 h-3" />
              Notarization Required
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ComplianceItem({ 
  label, 
  status 
}: { 
  label: string
  status: 'complete' | 'pending'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        {status === 'complete' ? (
          <>
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Complete</span>
          </>
        ) : (
          <>
            <ClockIcon className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Pending</span>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ICONS
// ============================================================================

function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ExclamationIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
}

function ChartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function UsersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}
