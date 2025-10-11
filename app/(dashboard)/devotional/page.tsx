import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'

/**
 * 📖 Devotional Journey - Sacred Rhythm
 * Guided reflection, not open-ended journaling
 */
export default async function DevotionalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = format(new Date(), 'EEEE, MMMM d')
  const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

  // If it's Sunday, show Table Talk instead
  if (dayOfWeek === 0) {
    return <SundayTableTalkView />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
          Sacred Rhythm
        </h1>
        <p className="text-xl text-gray-600">{today}</p>
      </div>

      {/* Current Week Progress */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
        <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">This Week&apos;s Journey</h2>
        <div className="flex gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="flex-1 text-center">
              <div className="text-xs text-gray-600 mb-2">{day}</div>
              <div className={`h-12 rounded-lg flex items-center justify-center ${
                index < dayOfWeek - 1 
                  ? 'bg-green-100 text-green-700' 
                  : index === dayOfWeek - 1 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {index < dayOfWeek - 1 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : index === dayOfWeek - 1 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs">•</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Complete all 6 days to unlock Sunday&apos;s Family Table Talk
        </p>
      </div>

      {/* Today's Scripture & Reflection */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 rounded-2xl p-8 border border-orange-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
            Week 1: A Week of Gratitude
          </h2>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-8 mb-8 border border-white/40">
            <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
              &ldquo;Give thanks in all circumstances; for this is God&apos;s will for you in Christ Jesus.&rdquo;
            </p>
            <p className="text-sm text-gray-600">1 Thessalonians 5:18</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur rounded-lg p-6 mb-8">
            <h3 className="text-lg font-serif font-medium text-gray-900 mb-4">
              Today&apos;s Reflection
            </h3>
            <p className="text-gray-800 text-lg leading-relaxed">
              What unexpected blessing did you notice today?
            </p>
          </div>
          
          <div className="space-y-4">
            <textarea
              placeholder="Take a moment to reflect and write your thoughts..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Save Reflection
              </button>
              
              <button className="flex-1 border-2 border-orange-300 hover:border-orange-400 text-orange-700 hover:text-orange-800 px-6 py-3 rounded-lg font-medium transition-colors">
                Record Voice Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Family Connection */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-medium text-gray-900">Tonight&apos;s Family Connection</h3>
        </div>
        
        <div className="bg-white/80 rounded-lg p-4 mb-4">
          <p className="text-gray-800 font-medium mb-2">
            Share this question with your family tonight:
          </p>
          <p className="text-gray-700 italic">
            &ldquo;What unexpected blessing did you notice today?&rdquo;
          </p>
        </div>
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
          Set Reminder for Tonight
        </button>
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
          href="/vault"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Add to Legacy Vault
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function SundayTableTalkView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
          Your Week Became This
        </h1>
        <p className="text-xl text-gray-600">Sunday, Family Table Talk</p>
      </div>

      {/* Week Complete Celebration */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-8 border border-green-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            Congratulations!
          </h2>
          
          <p className="text-lg text-gray-700 mb-8">
            You completed all 6 devotions this week. Your reflections have been transformed into a family game.
          </p>
          
          <Link
            href="/table-talk"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10V3a1 1 0 112 0v1m-2 0h4m-6 0h4m-6 0a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H9z" />
            </svg>
            Play Family Table Talk
          </Link>
        </div>
      </div>

      {/* Quick Preview */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-xl font-serif font-medium text-gray-900 mb-4">This Week&apos;s Highlights</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Monday: Noticed the sunrise during your commute</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Wednesday: Your daughter&apos;s unexpected hug</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Friday: Found peace in a difficult conversation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
