import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'

/**
 * 🗂️ Legacy Vault - One Day
 * Gentle urgency with smart prompts for family legacy
 */
export default async function VaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
          Legacy Vault
        </h1>
        <p className="text-xl text-gray-600">{today}</p>
      </div>

      {/* Urgency Hook - Gentle, Not Morbid */}
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 rounded-2xl p-8 border border-purple-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            What if tomorrow never comes?
          </h2>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Your family needs to know who you are, what you believe, and how much you love them. 
            Start with just one sentence today.
          </p>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
            <p className="text-gray-800 font-medium mb-2">
              &ldquo;Today I&apos;m grateful for...&rdquo;
            </p>
            <p className="text-sm text-gray-600">Start your legacy with gratitude</p>
          </div>
          
          <button className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write Your First Legacy Note
          </button>
        </div>
      </div>

      {/* Smart Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LegacyPrompt
          title="To My Daughter"
          subtitle="About Courage"
          prompt="Write one sentence about courage that you'd want your daughter to remember."
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="pink"
        />
        
        <LegacyPrompt
          title="To My Son"
          subtitle="About Integrity"
          prompt="What's one thing about integrity that you wish you knew at 25?"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="blue"
        />
        
        <LegacyPrompt
          title="To My Wife"
          subtitle="About Love"
          prompt="Record 30 seconds about your favorite memory together."
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          color="red"
        />
        
        <LegacyPrompt
          title="Childhood Memory"
          subtitle="For Future Generations"
          prompt="Share one favorite childhood memory that shaped who you are."
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Legacy Progress */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-xl font-serif font-medium text-gray-900 mb-4">Your Legacy Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">First Legacy Note</h4>
              <p className="text-sm text-gray-600">Start with one sentence of gratitude</p>
            </div>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Begin
            </button>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Family Letters</h4>
              <p className="text-sm text-gray-600">Write to each family member</p>
            </div>
            <span className="text-gray-400 text-sm">Coming Soon</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Voice Messages</h4>
              <p className="text-sm text-gray-600">Record your voice for One Day</p>
            </div>
            <span className="text-gray-400 text-sm">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Security Assurance */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-medium text-gray-900">Your Legacy is Protected</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">End-to-End Encryption</h4>
            <p className="text-xs text-gray-600">Only you can access your legacy</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Cloud Backup</h4>
            <p className="text-xs text-gray-600">Safe in multiple locations</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Timed Release</h4>
            <p className="text-xs text-gray-600">Choose when family sees it</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        
        <Link
          href="/devotional"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Continue Devotional Journey
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function LegacyPrompt({ 
  title, 
  subtitle, 
  prompt, 
  icon, 
  color 
}: { 
  title: string
  subtitle: string
  prompt: string
  icon: React.ReactNode
  color: 'pink' | 'blue' | 'red' | 'green'
}) {
  const colorClasses = {
    pink: 'bg-pink-50 border-pink-200 text-pink-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    green: 'bg-green-50 border-green-200 text-green-800'
  }

  const iconClasses = {
    pink: 'text-pink-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600'
  }

  const buttonClasses = {
    pink: 'bg-pink-600 hover:bg-pink-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white'
  }

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 border-2`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`${iconClasses[color]}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-serif font-medium text-lg">{title}</h3>
          <p className="text-sm opacity-75">{subtitle}</p>
        </div>
      </div>
      
      <p className="text-sm mb-4 leading-relaxed">{prompt}</p>
      
      <button className={`w-full ${buttonClasses[color]} px-4 py-2 rounded-lg font-medium transition-colors text-sm`}>
        Start Writing
      </button>
    </div>
  )
}

