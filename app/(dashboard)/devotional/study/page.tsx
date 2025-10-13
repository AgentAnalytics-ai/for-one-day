import { createClient } from '@/lib/supabase/server'
import { RECOMMENDED_BOOKS, BibleBook } from '@/lib/content/bible-library'
import { getPersonalizedRecommendations as getProgressRecommendations } from '@/lib/content/progression-system'
import Link from 'next/link'

/**
 * 📚 Devotional Study Page - Expert-Validated Learning Journey
 * Progressive disclosure with smart recommendations
 */
export default async function DevotionalStudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user progress (would be from database)
  const userProgress = {
    userId: user.id,
    completedBooks: [],
    completedChapters: {},
    currentBook: 'genesis',
    currentChapter: 1,
    streak: 0,
    totalMinutes: 0,
    favoriteBooks: [],
    learningPath: 'new-to-faith' as const,
    achievements: [],
    lastActiveDate: new Date().toISOString()
  }

  const progressRecommendations = getProgressRecommendations(userProgress)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-4">
          Your Devotional Journey
        </h1>
        <p className="text-xl text-gray-600">
          {progressRecommendations.motivationalMessage}
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <ProgressCard
          title="Current Streak"
          value={`${userProgress.streak} days`}
          description="Keep it going!"
          icon="🔥"
          color="red"
        />
        
        <ProgressCard
          title="Books Completed"
          value={`${userProgress.completedBooks.length}`}
          description="Bible exploration"
          icon="📖"
          color="blue"
        />
        
        <ProgressCard
          title="Total Time"
          value={`${userProgress.totalMinutes} min`}
          description="With God & family"
          icon="⏱️"
          color="green"
        />
        
        <ProgressCard
          title="Achievements"
          value={`${userProgress.achievements.length}`}
          description="Milestones earned"
          icon="🏆"
          color="purple"
        />
      </div>

      {/* Learning Path Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
          Choose Your Learning Path
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LearningPathCard
            id="new-to-faith"
            title="New to Faith"
            description="Perfect for starting your spiritual journey"
            books={['Genesis', 'Psalms', 'Matthew']}
            difficulty="beginner"
            estimatedTime="3-5 min/day"
          />
          
          <LearningPathCard
            id="family-focus"
            title="Family Focus"
            description="Building faith together as a family"
            books={['Psalms', 'Proverbs', 'Ephesians']}
            difficulty="beginner"
            estimatedTime="5-7 min/day"
          />
          
          <LearningPathCard
            id="deep-study"
            title="Deep Study"
            description="Comprehensive Bible exploration"
            books={['Genesis', 'Romans', 'Ephesians']}
            difficulty="advanced"
            estimatedTime="8-12 min/day"
          />
          
          <LearningPathCard
            id="quick-wins"
            title="Quick Wins"
            description="Short, powerful daily readings"
            books={['Psalms', 'Proverbs']}
            difficulty="beginner"
            estimatedTime="2-3 min/day"
          />
        </div>
      </div>

      {/* Recommended Books */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
          Recommended for You
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {RECOMMENDED_BOOKS.filter(book => book.recommended).slice(0, 6).map(book => (
            <BookCard
              key={book.id}
              book={book}
              isCurrent={userProgress.currentBook === book.id}
              progress={(userProgress.completedChapters as Record<string, number[]>)[book.id]?.length || 0}
              totalChapters={book.chapters}
            />
          ))}
        </div>
      </div>

      {/* Quick Start Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <QuickStartCard
          title="Continue Reading"
          description="Pick up where you left off"
          bookName={userProgress.currentBook ? (RECOMMENDED_BOOKS.find(b => b.id === userProgress.currentBook)?.name || 'Genesis') : 'Genesis'}
          chapterNumber={userProgress.currentChapter || 1}
          cta="Continue"
          href={`/devotional/read/${userProgress.currentBook || 'genesis'}/${userProgress.currentChapter || 1}`}
        />
        
        <QuickStartCard
          title="Start Fresh"
          description="Begin a new book or chapter"
          bookName="Choose a book"
          chapterNumber={1}
          cta="Browse Books"
          href="/devotional/books"
        />
      </div>

      {/* Family Connection */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
          Share Your Journey
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your spiritual growth becomes a blessing for your entire family. 
          Start meaningful conversations around the dinner table.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/table-talk"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
          >
            Generate Table Talk Questions
          </Link>
          
          <Link
            href="/one-day"
            className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 px-6 py-3 rounded-lg font-medium transition-colors text-center"
          >
            Create Legacy Item
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProgressCard({ 
  title, 
  value, 
  description, 
  icon, 
  color 
}: { 
  title: string
  value: string
  description: string
  icon: string
  color: 'red' | 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 mb-4 ${colorClasses[color]}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {title}
      </h3>
      
      <p className="text-2xl font-bold text-gray-900 mb-2">
        {value}
      </p>
      
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  )
}

function LearningPathCard({ 
  id, 
  title, 
  description, 
  books, 
  difficulty, 
  estimatedTime 
}: { 
  id: string
  title: string
  description: string
  books: string[]
  difficulty: string
  estimatedTime: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors cursor-pointer">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        {description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Books:</span>
          <span className="text-gray-700">{books.join(', ')}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Difficulty:</span>
          <span className="text-gray-700 capitalize">{difficulty}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Time:</span>
          <span className="text-gray-700">{estimatedTime}</span>
        </div>
      </div>
      
      <Link
        href={`/devotional/path/${id}`}
        className="block w-full bg-gray-900 hover:bg-gray-800 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
      >
        Start This Path
      </Link>
    </div>
  )
}

function BookCard({ 
  book, 
  isCurrent, 
  progress, 
  totalChapters 
}: { 
  book: BibleBook
  isCurrent: boolean
  progress: number
  totalChapters: number
}) {
  const progressPercent = (progress / totalChapters) * 100

  return (
    <div className={`rounded-xl border-2 p-6 ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'} hover:border-gray-300 transition-colors cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {book.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">
            {book.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="capitalize">{book.difficulty}</span>
            <span>{book.estimatedTime} min/chapter</span>
            <span>{book.chapters} chapters</span>
          </div>
        </div>
        
        {isCurrent && (
          <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Current
          </span>
        )}
      </div>
      
      {progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}/{totalChapters}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      
      <Link
        href={`/devotional/read/${book.id}/1`}
        className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
          isCurrent 
            ? 'bg-primary-500 hover:bg-primary-600 text-white' 
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {isCurrent ? 'Continue Reading' : 'Start Reading'}
      </Link>
    </div>
  )
}

function QuickStartCard({ 
  title, 
  description, 
  bookName, 
  chapterNumber, 
  cta, 
  href 
}: { 
  title: string
  description: string
  bookName: string
  chapterNumber: number
  cta: string
  href: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        {description}
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{bookName}</span>
          {chapterNumber > 0 && (
            <span className="text-gray-500"> • Chapter {chapterNumber}</span>
          )}
        </p>
      </div>
      
      <Link
        href={href}
        className="block w-full bg-gray-900 hover:bg-gray-800 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
      >
        {cta}
      </Link>
    </div>
  )
}
