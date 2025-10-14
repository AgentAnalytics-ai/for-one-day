'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'
import { useMemo } from 'react'
import type { FamilyRole, UserPermissions } from '@/lib/types/family'
import { getRoleDisplayName } from '@/lib/types/family'

/**
 * 🧭 Enterprise Dashboard Navigation
 * Role-based navigation with conditional access
 */

interface Profile {
  plan: string
  full_name?: string
}

interface FamilyContext {
  role: FamilyRole
  permissions: UserPermissions
  relationship?: string
  display_name?: string
}

interface EnterpriseNavProps {
  profile: Profile | null
  familyContext: FamilyContext | null
}

export function EnterpriseNav({ profile, familyContext }: EnterpriseNavProps) {
  const pathname = usePathname()

  const navItems = useMemo(() => {
    if (!familyContext) {
      return [
        { 
          href: '/dashboard', 
          label: 'Dashboard', 
          icon: <HomeIcon />,
          description: 'Your family overview'
        }
      ]
    }

    const { role, permissions } = familyContext
    const items = []

    // Dashboard - Always available
    items.push({
      href: '/dashboard',
      label: 'Dashboard',
      icon: <HomeIcon />,
      description: 'Your family overview'
    })

    // Devotional - Based on permissions
    if (permissions.devotional.read) {
      items.push({
        href: '/devotional/interactive',
        label: role === 'child_minor' ? 'My Devotions' : 'Devotional',
        icon: <BookIcon />,
        description: role === 'child_minor' ? 'Age-appropriate devotions' : 'Daily spiritual growth'
      })
    }

    // Table Talk - Family activity
    if (permissions.family.read && !['trust_executor', 'emergency_contact'].includes(role)) {
      items.push({
        href: '/table-talk',
        label: 'Table Talk',
        icon: <UsersIcon />,
        description: 'Family conversation game'
      })
    }

    // Vault/Legacy - Role-specific naming and access
    if (permissions.vault.read) {
      let vaultLabel = 'For One Day'
      let vaultDescription = 'Family legacy vault'
      
      if (role === 'trust_executor') {
        vaultLabel = 'Legal Vault'
        vaultDescription = 'Legal documents and estate'
      } else if (role === 'child_adult') {
        vaultLabel = 'Family Legacy'
        vaultDescription = 'Letters and memories for you'
      } else if (role === 'mother') {
        vaultLabel = 'Our Legacy'
        vaultDescription = 'Family memories and letters'
      }
      
      items.push({
        href: '/one-day/interactive',
        label: vaultLabel,
        icon: <LockIcon />,
        description: vaultDescription
      })
    }

    // Family Management - Parents and some roles
    if (permissions.family.admin || permissions.can_invite_members) {
      items.push({
        href: '/family/settings',
        label: 'Family',
        icon: <SettingsIcon />,
        description: 'Manage family members'
      })
    }

    // Legal Dashboard - Trust Executors only
    if (role === 'trust_executor' && permissions.legal_authority) {
      items.push({
        href: '/legal/dashboard',
        label: 'Legal Dashboard',
        icon: <ScaleIcon />,
        description: 'Estate and legal documents'
      })
    }

    // Emergency Access - Emergency contacts
    if (role === 'emergency_contact' || permissions.emergency_access) {
      items.push({
        href: '/emergency/access',
        label: 'Emergency Access',
        icon: <ExclamationIcon />,
        description: 'Crisis family access'
      })
    }

    return items
  }, [familyContext])

  const userDisplayName = familyContext?.display_name || profile?.full_name || 'User'
  const userRole = familyContext ? getRoleDisplayName(familyContext.role) : 'Member'

  return (
    <nav className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-serif font-bold text-gray-900">
              For One Day
            </span>
          </Link>

          {/* Nav items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.description}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            {familyContext && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyles(familyContext.role)}`}>
                  {userRole}
                </div>
              </div>
            )}
            
            {/* Upgrade Link */}
            {profile?.plan === 'free' && familyContext?.permissions.billing.read && (
              <Link
                href="/upgrade"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Upgrade to Pro
              </Link>
            )}
            
            {/* User Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-xs">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">{userDisplayName}</span>
                <ChevronDownIcon />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {userDisplayName}
                    <div className="text-gray-400">{userRole}</div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Profile Settings
                  </Link>
                  
                  {familyContext?.permissions.family.admin && (
                    <Link
                      href="/family/settings"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Family Settings
                    </Link>
                  )}
                  
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto pb-4 space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRoleBadgeStyles(role: FamilyRole): string {
  const styles: Record<FamilyRole, string> = {
    father: 'bg-blue-100 text-blue-800',
    mother: 'bg-pink-100 text-pink-800', 
    child_adult: 'bg-green-100 text-green-800',
    child_minor: 'bg-yellow-100 text-yellow-800',
    trust_executor: 'bg-purple-100 text-purple-800',
    family_advisor: 'bg-indigo-100 text-indigo-800',
    emergency_contact: 'bg-orange-100 text-orange-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  
  return styles[role] || styles.viewer
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  )
}

function ExclamationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
