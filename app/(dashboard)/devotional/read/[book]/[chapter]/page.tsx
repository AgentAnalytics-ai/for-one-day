import { createClient } from '@/lib/supabase/server'
import { RECOMMENDED_BOOKS } from '@/lib/content/bible-library'
import { generateDevotional, generateTableTalkQuestions } from '@/lib/content/ai-generator'
import { getBibleChapter } from '@/lib/content/bible-text'
import Link from 'next/link'
import { notFound } from 'next/navigation'

/**
 * 📖 Devotional Reading Experience - Premium 3-Minute Journey
 * Expert-validated progressive disclosure and engagement
 */
export default async function DevotionalReadPage({ 
  params 
}: { 
  params: { book: string; chapter: string } 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const bookId = params.book
  const chapterNumber = parseInt(params.chapter)

  const book = RECOMMENDED_BOOKS.find(b => b.id === bookId)
  if (!book || chapterNumber < 1 || chapterNumber > book.chapters) {
    notFound()
  }

  // Get Bible text and generate devotional content
  const bibleChapter = getBibleChapter(bookId, chapterNumber)
  const devotional = await generateDevotional(book, chapterNumber, bibleChapter?.keyThemes || ['faith', 'family', 'leadership'])
  const tableTalkQuestions = await generateTableTalkQuestions(book, chapterNumber)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/devotional/study" className="hover:text-gray-700 transition-colors">
            Study
          </Link>
          <span>→</span>
          <Link href={`/devotional/read/${bookId}`} className="hover:text-gray-700 transition-colors">
            {book.name}
          </Link>
          <span>→</span>
          <span className="text-gray-900">Chapter {chapterNumber}</span>
        </div>
        
        <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
          {devotional.title}
        </h1>
        
        <p className="text-lg text-gray-600">
          {book.name} Chapter {chapterNumber} • {devotional.estimatedTime} minutes
        </p>
      </div>

      {/* Reading Progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Reading Progress</span>
          <span>{chapterNumber} of {book.chapters} chapters</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(chapterNumber / book.chapters) * 100}%` }}
          />
        </div>
      </div>

      {/* Bible Text */}
      {bibleChapter && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-6">
            Scripture Reading
          </h2>
          
          <div className="space-y-4">
            {bibleChapter.verses.map((verse, index) => (
              <div key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
                  {verse.verse}
                </span>
                
                <p className="text-gray-800 leading-relaxed text-lg">
                  {verse.text}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {bibleChapter.book} {bibleChapter.chapter} • {bibleChapter.verses[0]?.translation}
            </p>
          </div>
        </div>
      )}

      {/* Devotional Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
        {/* Summary */}
        <div>
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">
            Today&apos;s Reflection
          </h2>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {bibleChapter?.summary || devotional.summary}
            </p>
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-6">
            Personal Reflection
          </h2>
          
          <div className="space-y-6">
            {devotional.reflectionQuestions.map((question, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-gray-800 font-medium mb-3">
                      {question}
                    </p>
                    
                    <textarea
                      placeholder="Share your thoughts..."
                      className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer Prompt */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">
            Prayer
          </h2>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-gray-800 italic leading-relaxed">
              {devotional.prayerPrompt}
            </p>
          </div>
        </div>

        {/* Family Action */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">
            Family Connection
          </h2>
          
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-gray-800 leading-relaxed mb-4">
              {devotional.familyAction}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/table-talk"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center text-sm"
              >
                Generate Table Talk Questions
              </Link>
              
              <Link
                href="/one-day"
                className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 px-4 py-2 rounded-lg font-medium transition-colors text-center text-sm"
              >
                Save to For One Day
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={chapterNumber > 1 ? `/devotional/read/${bookId}/${chapterNumber - 1}` : `/devotional/read/${bookId}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            chapterNumber > 1 
              ? 'bg-gray-900 hover:bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous Chapter
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/devotional/study"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Back to Study
          </Link>
          
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Mark Complete
          </button>
        </div>

        <Link
          href={chapterNumber < book.chapters ? `/devotional/read/${bookId}/${chapterNumber + 1}` : `/devotional/study`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            chapterNumber < book.chapters 
              ? 'bg-gray-900 hover:bg-gray-800 text-white' 
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {chapterNumber < book.chapters ? 'Next Chapter' : 'Complete Book'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Table Talk Preview */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 p-8">
        <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">
          This Week&apos;s Table Talk Questions
        </h2>
        
        <p className="text-gray-600 mb-6">
          Transform your family dinner into meaningful conversation with questions inspired by this chapter.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {tableTalkQuestions.slice(0, 4).map((question, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-medium text-xs">
                    {index + 1}
                  </span>
                </div>
                
                <p className="text-gray-800 text-sm">
                  {question}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <Link
          href="/table-talk"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Get All 7 Questions
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
