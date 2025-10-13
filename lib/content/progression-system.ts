/**
 * 🎯 Learning Progression System - Expert-Validated Journey
 * Builds engagement and retention through smart progression
 */

import { BibleBook, LEARNING_PATHS, LearningPath } from './bible-library'
import { DevotionalContent } from './bible-library'

export interface UserProgress {
  userId: string
  completedBooks: string[]
  completedChapters: { [bookId: string]: number[] }
  currentBook?: string
  currentChapter?: number
  streak: number
  totalMinutes: number
  favoriteBooks: string[]
  learningPath: LearningPath
  achievements: Achievement[]
  lastActiveDate: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  category: 'streak' | 'completion' | 'family' | 'special'
}

export interface LearningMilestone {
  id: string
  title: string
  description: string
  requirements: {
    booksCompleted?: number
    chaptersCompleted?: number
    streakDays?: number
    familySessions?: number
  }
  reward: string
  unlocked: boolean
}

/**
 * 🎯 EXPERT-CURATED ACHIEVEMENT SYSTEM
 * Gamification that builds spiritual habits, not just engagement
 */

export const ACHIEVEMENTS = {
  // STREAK ACHIEVEMENTS
  'first-week': {
    id: 'first-week',
    name: 'First Week',
    description: 'Completed 7 days of devotions',
    icon: '🔥',
    category: 'streak' as const
  },
  'month-warrior': {
    id: 'month-warrior', 
    name: 'Month Warrior',
    description: '30-day devotion streak',
    icon: '⚡',
    category: 'streak' as const
  },
  'hundred-club': {
    id: 'hundred-club',
    name: 'Hundred Club', 
    description: '100 days of consistent devotions',
    icon: '💯',
    category: 'streak' as const
  },

  // COMPLETION ACHIEVEMENTS
  'first-book': {
    id: 'first-book',
    name: 'Book Explorer',
    description: 'Completed your first book',
    icon: '📖',
    category: 'completion' as const
  },
  'old-testament': {
    id: 'old-testament',
    name: 'Ancient Wisdom',
    description: 'Completed 5 Old Testament books',
    icon: '🏛️',
    category: 'completion' as const
  },
  'new-testament': {
    id: 'new-testament',
    name: 'New Covenant',
    description: 'Completed 5 New Testament books',
    icon: '✝️',
    category: 'completion' as const
  },

  // FAMILY ACHIEVEMENTS
  'table-talk-starter': {
    id: 'table-talk-starter',
    name: 'Table Talk Starter',
    description: 'Led your first family discussion',
    icon: '🍽️',
    category: 'family' as const
  },
  'family-teacher': {
    id: 'family-teacher',
    name: 'Family Teacher',
    description: '10 family Table Talk sessions',
    icon: '👨‍👧‍👦',
    category: 'family' as const
  },
  'legacy-builder': {
    id: 'legacy-builder',
    name: 'Legacy Builder',
    description: 'Created 5 For One Day items',
    icon: '🏰',
    category: 'family' as const
  },

  // SPECIAL ACHIEVEMENTS
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Completed devotion before 6 AM',
    icon: '🌅',
    category: 'special' as const
  },
  'weekend-warrior': {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Completed weekend devotions',
    icon: '🗓️',
    category: 'special' as const
  }
} as const

/**
 * 🎯 LEARNING MILESTONES
 * Major progression markers that unlock new content
 */

export const MILESTONES: LearningMilestone[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Complete your first devotion',
    requirements: { chaptersCompleted: 1 },
    reward: 'Unlock Genesis study guide',
    unlocked: false
  },
  {
    id: 'week-habit',
    title: 'Week of Growth',
    description: 'Build a week-long habit',
    requirements: { streakDays: 7 },
    reward: 'Unlock Psalms collection',
    unlocked: false
  },
  {
    id: 'family-leader',
    title: 'Family Leader',
    description: 'Start leading family discussions',
    requirements: { familySessions: 3 },
    reward: 'Unlock Table Talk premium questions',
    unlocked: false
  },
  {
    id: 'book-master',
    title: 'Book Master',
    description: 'Complete your first book',
    requirements: { booksCompleted: 1 },
    reward: 'Unlock next recommended book',
    unlocked: false
  },
  {
    id: 'month-strong',
    title: 'Month Strong',
    description: '30 days of consistent growth',
    requirements: { streakDays: 30 },
    reward: 'Unlock advanced study materials',
    unlocked: false
  }
]

/**
 * 🎯 PROGRESSION SYSTEM FUNCTIONS
 */

export function calculateProgress(userProgress: UserProgress): {
  overallProgress: number
  currentBookProgress: number
  streakProgress: number
  nextMilestone?: LearningMilestone
} {
  const totalPossibleChapters = 1189 // Total Bible chapters
  const completedChapters = Object.values(userProgress.completedChapters)
    .flat().length
  
  const overallProgress = (completedChapters / totalPossibleChapters) * 100
  
  let currentBookProgress = 0
  if (userProgress.currentBook) {
    const currentBookChapters = Object.values(userProgress.completedChapters[userProgress.currentBook] || [])
    const bookTotal = 50 // Would need to get actual book chapter count
    currentBookProgress = (currentBookChapters.length / bookTotal) * 100
  }
  
  const streakProgress = Math.min((userProgress.streak / 30) * 100, 100)
  
  const nextMilestone = MILESTONES.find(milestone => 
    !milestone.unlocked && checkMilestoneRequirements(milestone, userProgress)
  )
  
  return {
    overallProgress: Math.round(overallProgress * 100) / 100,
    currentBookProgress: Math.round(currentBookProgress * 100) / 100,
    streakProgress: Math.round(streakProgress * 100) / 100,
    nextMilestone
  }
}

export function checkMilestoneRequirements(
  milestone: LearningMilestone, 
  progress: UserProgress
): boolean {
  const { requirements } = milestone
  
  if (requirements.booksCompleted && progress.completedBooks.length < requirements.booksCompleted) {
    return false
  }
  
  if (requirements.chaptersCompleted) {
    const totalChapters = Object.values(progress.completedChapters).flat().length
    if (totalChapters < requirements.chaptersCompleted) {
      return false
    }
  }
  
  if (requirements.streakDays && progress.streak < requirements.streakDays) {
    return false
  }
  
  if (requirements.familySessions) {
    // Would need to track family sessions separately
    return false // Placeholder
  }
  
  return true
}

export function getRecommendedNextBook(
  userProgress: UserProgress,
  availableBooks: BibleBook[]
): BibleBook | null {
  const learningPath = LEARNING_PATHS[userProgress.learningPath]
  const completedBooks = userProgress.completedBooks
  
  // Find next book in learning path
  for (const bookId of learningPath) {
    if (!completedBooks.includes(bookId)) {
      const book = availableBooks.find(b => b.id === bookId)
      if (book) return book
    }
  }
  
  // If path completed, suggest based on interests
  const familyFriendlyBooks = availableBooks.filter(book => 
    book.familyFriendly && !completedBooks.includes(book.id)
  )
  
  return familyFriendlyBooks[0] || null
}

export function unlockAchievement(
  achievementId: keyof typeof ACHIEVEMENTS,
  userProgress: UserProgress
): Achievement | null {
  const achievement = ACHIEVEMENTS[achievementId]
  if (!achievement) return null
  
  // Check if already unlocked
  const alreadyUnlocked = userProgress.achievements.some(a => a.id === achievementId)
  if (alreadyUnlocked) return null
  
  const newAchievement: Achievement = {
    ...achievement,
    unlockedAt: new Date().toISOString()
  }
  
  return newAchievement
}

export function checkAndUnlockAchievements(
  userProgress: UserProgress
): Achievement[] {
  const newAchievements: Achievement[] = []
  
  // Check streak achievements
  if (userProgress.streak >= 7 && !userProgress.achievements.some(a => a.id === 'first-week')) {
    const achievement = unlockAchievement('first-week', userProgress)
    if (achievement) newAchievements.push(achievement)
  }
  
  if (userProgress.streak >= 30 && !userProgress.achievements.some(a => a.id === 'month-warrior')) {
    const achievement = unlockAchievement('month-warrior', userProgress)
    if (achievement) newAchievements.push(achievement)
  }
  
  if (userProgress.streak >= 100 && !userProgress.achievements.some(a => a.id === 'hundred-club')) {
    const achievement = unlockAchievement('hundred-club', userProgress)
    if (achievement) newAchievements.push(achievement)
  }
  
  // Check completion achievements
  if (userProgress.completedBooks.length >= 1 && !userProgress.achievements.some(a => a.id === 'first-book')) {
    const achievement = unlockAchievement('first-book', userProgress)
    if (achievement) newAchievements.push(achievement)
  }
  
  return newAchievements
}

/**
 * 🎯 SMART RECOMMENDATION ENGINE
 */

export function getPersonalizedRecommendations(userProgress: UserProgress): {
  nextDevotion?: BibleBook
  suggestedBooks: BibleBook[]
  motivationalMessage: string
} {
  const nextBook = getRecommendedNextBook(userProgress, [])
  const progress = calculateProgress(userProgress)
  
  let motivationalMessage = "Keep up the great work! Your family is blessed by your commitment."
  
  if (progress.overallProgress < 1) {
    motivationalMessage = "You're taking the first step in an incredible journey. Every great legacy begins with a single decision."
  } else if (progress.overallProgress < 5) {
    motivationalMessage = "You're building something beautiful. Consistency is the foundation of spiritual growth."
  } else if (progress.streakProgress > 80) {
    motivationalMessage = "Your dedication is inspiring! You're modeling faithfulness for your family."
  }
  
  return {
    nextDevotion: nextBook || undefined,
    suggestedBooks: [], // Would populate with actual recommendations
    motivationalMessage
  }
}
