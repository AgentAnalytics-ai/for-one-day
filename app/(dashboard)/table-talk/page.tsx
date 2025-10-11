import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'

/**
 * 🎮 Table Talk - Family Connection Magic
 * Game-ified family conversations from your week
 */
export default async function TableTalkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
          Family Table Talk
        </h1>
        <p className="text-xl text-gray-600">{today}</p>
      </div>

      {/* Pre-Game Setup */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            This Week, Dad Learned...
          </h2>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
            <p className="text-lg text-gray-700 mb-4">
              &ldquo;I discovered that gratitude isn&apos;t just about saying thanks—it&apos;s about noticing the small blessings that happen every day, even in the midst of challenges.&rdquo;
            </p>
            <p className="text-sm text-gray-600">From your Week 1: A Week of Gratitude</p>
          </div>
          
          <p className="text-xl text-gray-800 mb-8 leading-relaxed">
            Now let's turn your week into a family conversation game!
          </p>
          
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10V3a1 1 0 112 0v1m-2 0h4m-6 0h4m-6 0a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H9z" />
            </svg>
            Start Family Game
          </button>
        </div>
      </div>

      {/* Game Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard
          type="prompt"
          title="Gratitude Challenge"
          question="What&apos;s one thing that made you smile today that you normally wouldn&apos;t notice?"
          difficulty="Easy"
          color="green"
        />
        
        <GameCard
          type="guess"
          title="Dad's Week"
          question="Which day do you think Dad felt most grateful?"
          options={["Monday", "Wednesday", "Friday"]}
          difficulty="Medium"
          color="blue"
        />
        
        <GameCard
          type="verse"
          title="Memory Verse"
          question="Complete this verse: 'Give thanks in all circumstances; for this is...'"
          difficulty="Hard"
          color="purple"
        />
      </div>

      {/* Family Connection Stats */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-xl font-serif font-medium text-gray-900 mb-4">Family Connection Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">15 Minutes</h4>
            <p className="text-sm text-gray-600">Quality family time</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">5 Questions</h4>
            <p className="text-sm text-gray-600">Meaningful conversations</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">1 Memory</h4>
            <p className="text-sm text-gray-600">Saved to family vault</p>
          </div>
        </div>
      </div>

      {/* Post-Game */}
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-medium text-gray-900">What Stood Out Tonight?</h3>
        </div>
        
        <div className="bg-white/80 rounded-lg p-4 mb-4">
          <textarea
            placeholder="Share one insight or moment that made tonight special..."
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-4">
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            Save This Week's Memory
          </button>
          
          <Link
            href="/vault"
            className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-3 rounded-lg font-medium transition-colors text-center"
          >
            Add to Legacy Vault
          </Link>
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

function GameCard({ 
  type, 
  title, 
  question, 
  options, 
  difficulty, 
  color 
}: { 
  type: 'prompt' | 'guess' | 'verse'
  title: string
  question: string
  options?: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  color: 'green' | 'blue' | 'purple'
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  }

  const iconClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  }

  const icons = {
    prompt: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    guess: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    verse: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  }

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 border-2`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 ${iconClasses[color]}`}>
          {icons[type]}
          <span className="font-medium text-sm">{type.toUpperCase()}</span>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded-full">
          {difficulty}
        </span>
      </div>
      
      <h3 className="font-serif font-medium text-lg mb-3">{title}</h3>
      <p className="text-sm mb-4 leading-relaxed">{question}</p>
      
      {options && (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="text-xs bg-white/30 rounded px-3 py-2">
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}