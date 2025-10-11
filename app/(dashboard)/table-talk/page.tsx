/**
 * 🎮 Table Talk page - Sunday game
 * AI-generated conversation game from the week's devotions
 */
export default async function TableTalkPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Table Talk
        </h1>
        <p className="text-gray-600 mt-1">Your Sunday family game</p>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl p-12 text-center">
        <p className="text-6xl mb-4">🎮</p>
        <h2 className="text-2xl font-serif font-bold mb-2">Complete This Week&apos;s Devotions</h2>
        <p className="text-gray-600 mb-6">
          Your Table Talk deck will be ready after you complete<br />
          Monday-Saturday devotional entries
        </p>
        <div className="inline-flex gap-2 mt-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500"
            >
              {day.charAt(0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

