import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReflectionForm } from '@/components/reflection/reflection-form'

/**
 * 📖 Daily Reflection Page
 * Server component for stability
 */
export default async function ReflectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Get today's reflection if it exists
  const { data: existingReflection } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // If no reflection exists, create a simple daily prompt
  const dailyPrompts = [
    "What are you most grateful for today?",
    "What challenge did you face today, and how did you grow from it?",
    "What moment brought you the most joy today?",
    "What did you learn about yourself today?",
    "How did you show love to someone today?",
    "What would you like to remember about today?",
    "What are you looking forward to tomorrow?"
  ]

  const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const promptIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Use Sunday prompt for Sunday, otherwise use day-1

  const reflectionData = existingReflection ? {
    day: new Date().getDay(),
    date: today,
    question: "What are you most grateful for today?",
    completed: true,
    userReflection: existingReflection.reflection
  } : {
    day: dayOfWeek,
    date: today,
    question: dailyPrompts[promptIndex],
    completed: false,
    userReflection: null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">
          Today&apos;s Reflection
        </h1>
        <p className="text-lg text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-blue-100">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
            God is inviting you to...
          </h2>
          
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 border border-white/40">
            <p className="text-lg text-blue-600 font-medium mb-3">
              1 Thessalonians 5:18
            </p>
            <p className="text-lg text-gray-700 italic mb-4">
              &ldquo;Give thanks in all circumstances; for this is God&apos;s will for you in Christ Jesus.&rdquo;
            </p>
            <p className="text-lg text-gray-800 font-medium">
              {reflectionData.question}
            </p>
          </div>

          {reflectionData.completed ? (
            <div className="bg-green-50 p-6 rounded-xl mb-6 border border-green-200">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium text-lg">Reflection completed!</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <p className="text-gray-800 italic">&ldquo;{reflectionData.userReflection}&rdquo;</p>
              </div>
            </div>
          ) : (
            <ReflectionForm />
          )}
        </div>
      </div>
    </div>
  )
}