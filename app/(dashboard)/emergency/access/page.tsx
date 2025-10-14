import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { getUserPermissions } from '@/lib/types/family'
import type { FamilyMember, EmergencyAccessLog } from '@/lib/types/family'
import { EmergencyAccessForm } from '@/components/emergency/emergency-access-form'

/**
 * 🚨 Emergency Access Portal
 * Crisis family access system with audit trails
 */
export default async function EmergencyAccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get family context and verify emergency access
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

  // Check if user has emergency access
  if (!permissions.emergency_access && familyMember.role !== 'trust_executor') {
    redirect('/dashboard?error=' + encodeURIComponent('Emergency access not authorized'))
  }

  // Fetch family information
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single()

  // Fetch emergency access logs
  const { data: emergencyLogs } = await supabase
    .from('emergency_access_logs')
    .select(`
      *,
      profiles!emergency_access_logs_accessed_by_fkey (full_name),
      verifier:profiles!emergency_access_logs_verified_by_fkey (full_name)
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch family members for context
  const { data: familyMembers } = await supabase
    .from('family_members')
    .select(`
      *,
      profiles (full_name, avatar_url)
    `)
    .eq('family_id', familyId)

  // Check for active emergency access
  const activeEmergency = emergencyLogs?.find(log => 
    log.accessed_by === user.id && 
    !log.resolved_at && 
    new Date(log.expires_at) > new Date()
  )

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              Emergency Access
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Crisis access for {family?.name}
            </p>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              familyMember.role === 'trust_executor' 
                ? 'bg-purple-100 text-purple-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {familyMember.role === 'trust_executor' ? 'Trust Executor' : 'Emergency Contact'}
            </div>
          </div>
        </div>
      </div>

      {/* Active Emergency Banner */}
      {activeEmergency && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-2">
                Active Emergency Access Session
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Emergency Type: <span className="font-medium capitalize">{activeEmergency.emergency_type}</span>
              </p>
              <p className="text-sm text-red-700 mb-4">
                Expires: {format(new Date(activeEmergency.expires_at), 'MMM d, yyyy h:mm a')}
              </p>
              <div className="flex gap-3">
                <Link
                  href="/one-day/interactive"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Access Family Vault
                </Link>
                <Link
                  href="/emergency/resolve"
                  className="bg-white hover:bg-red-50 text-red-700 border border-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Resolve Emergency
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Access Form */}
      {!activeEmergency && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-medium text-gray-900 mb-2">
              Request Emergency Access
            </h2>
            <p className="text-gray-600">
              Emergency access provides temporary, audited access to family information during crisis situations.
            </p>
          </div>
          
          <div className="p-6">
            <EmergencyAccessForm familyId={familyId} />
          </div>
        </div>
      )}

      {/* Emergency Protocols */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif font-medium text-gray-900">
            Emergency Protocols
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmergencyProtocolCard
              title="Medical Emergency"
              description="Access medical directives, insurance information, and emergency contacts"
              icon={<MedicalIcon />}
              actions={[
                'View medical directives',
                'Access insurance policies', 
                'Contact emergency contacts',
                'Review medication lists'
              ]}
            />
            
            <EmergencyProtocolCard
              title="Legal Emergency"
              description="Access wills, trusts, and legal documents for estate matters"
              icon={<LegalIcon />}
              actions={[
                'Review will and testament',
                'Access trust documents',
                'Contact legal representatives',
                'Review beneficiary information'
              ]}
            />
            
            <EmergencyProtocolCard
              title="Death/Incapacitation"
              description="Full family access for end-of-life or incapacitation situations"
              icon={<HeartIcon />}
              actions={[
                'Access all legal documents',
                'Review family vault',
                'Contact all family members',
                'Execute estate plans'
              ]}
            />
            
            <EmergencyProtocolCard
              title="Family Crisis"
              description="Temporary access during family emergencies or separations"
              icon={<FamilyIcon />}
              actions={[
                'Access family communications',
                'Review custody documents',
                'Contact support networks',
                'Coordinate family care'
              ]}
            />
          </div>
        </div>
      </div>

      {/* Family Emergency Contacts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif font-medium text-gray-900">
            Family Emergency Contacts
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers?.filter(member => 
              member.emergency_access || member.role === 'trust_executor'
            ).map(member => (
              <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {member.profiles?.full_name?.charAt(0) || member.display_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {member.profiles?.full_name || member.display_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {member.role.replace('_', ' ')} • {member.relationship}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {member.role === 'trust_executor' ? 'Legal Authority' : 'Emergency Contact'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Emergency Access Log */}
      {emergencyLogs && emergencyLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-medium text-gray-900">
                Emergency Access History
              </h2>
              <Link
                href="/emergency/logs"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {emergencyLogs.slice(0, 5).map((log) => (
                <EmergencyLogItem key={log.id} log={log as EmergencyAccessLog & { profiles: any, verifier: any }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Emergency Access Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Emergency access is logged and audited for security</li>
              <li>• Access expires automatically after the specified duration</li>
              <li>• Family members are notified of emergency access requests</li>
              <li>• Only use emergency access during genuine crisis situations</li>
              <li>• Contact family members directly when possible before using emergency access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

function EmergencyProtocolCard({ 
  title, 
  description, 
  icon, 
  actions 
}: {
  title: string
  description: string
  icon: React.ReactNode
  actions: string[]
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      
      <ul className="space-y-1">
        {actions.map((action, index) => (
          <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmergencyLogItem({ 
  log 
}: { 
  log: EmergencyAccessLog & { profiles: any, verifier: any } 
}) {
  const isActive = !log.resolved_at && new Date(log.expires_at) > new Date()
  
  return (
    <div className={`p-4 border rounded-lg ${
      isActive ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              isActive 
                ? 'bg-red-100 text-red-800'
                : log.resolved_at 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {log.emergency_type}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(log.created_at), 'MMM d, h:mm a')}
            </span>
          </div>
          
          <p className="text-sm text-gray-900 mb-1">
            <span className="font-medium">{log.profiles?.full_name || 'Unknown User'}</span> requested emergency access
          </p>
          
          <p className="text-xs text-gray-600">{log.access_reason}</p>
          
          {log.resolved_at && (
            <p className="text-xs text-green-600 mt-2">
              Resolved {format(new Date(log.resolved_at), 'MMM d, h:mm a')}
              {log.verifier && ` by ${log.verifier.full_name}`}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-red-500' : log.resolved_at ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ICONS
// ============================================================================

function MedicalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function LegalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function FamilyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
