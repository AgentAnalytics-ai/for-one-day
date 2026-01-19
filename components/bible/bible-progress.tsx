'use client'

interface BibleProgressProps {
  progress: {
    currentDay: number
    totalDays: number
    percentage: number
    currentBook: string
    currentChapter: number
    daysRemaining: number
  }
}

/**
 * 📊 Bible Reading Progress Visualization
 * Shows progress bar and stats
 */
export function BibleProgress({ progress }: BibleProgressProps) {
  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-600 text-center">
          {progress.percentage}% Complete
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{progress.currentDay}</div>
          <div className="text-xs text-gray-600">Days Done</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{progress.daysRemaining}</div>
          <div className="text-xs text-gray-600">Days Left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{progress.totalDays}</div>
          <div className="text-xs text-gray-600">Total Days</div>
        </div>
      </div>
    </div>
  )
}
