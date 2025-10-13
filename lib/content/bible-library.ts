/**
 * 📚 Bible Library - Custom Content System
 * Expert-validated approach for premium devotional experience
 */

export interface BibleBook {
  id: string
  name: string
  testament: 'old' | 'new'
  category: 'law' | 'history' | 'wisdom' | 'prophets' | 'gospels' | 'epistles' | 'revelation'
  chapters: number
  description: string
  recommended: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  familyFriendly: boolean
  estimatedTime: number // minutes per chapter
}

export interface BibleChapter {
  bookId: string
  chapterNumber: number
  verses: BibleVerse[]
  summary: string
  keyThemes: string[]
  familyDiscussionPoints: string[]
  historicalContext?: string
}

export interface BibleVerse {
  chapterNumber: number
  verseNumber: number
  text: string
  translation: 'ESV' | 'NIV' | 'NLT'
}

export interface DevotionalContent {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  summary: string // 3-minute read
  reflectionQuestions: string[]
  prayerPrompt: string
  familyAction: string
  relatedVerses: string[]
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// 🎯 EXPERT-CURATED BOOK SELECTION
export const RECOMMENDED_BOOKS: BibleBook[] = [
  // BEGINNER-FRIENDLY STARTERS
  {
    id: 'genesis',
    name: 'Genesis',
    testament: 'old',
    category: 'law',
    chapters: 50,
    description: 'The story of creation, God\'s covenant with Abraham, and the beginning of everything.',
    recommended: true,
    difficulty: 'beginner',
    familyFriendly: true,
    estimatedTime: 8
  },
  {
    id: 'psalms',
    name: 'Psalms',
    testament: 'old',
    category: 'wisdom',
    chapters: 150,
    description: 'Prayers, praises, and honest conversations with God that speak to every father\'s heart.',
    recommended: true,
    difficulty: 'beginner',
    familyFriendly: true,
    estimatedTime: 5
  },
  {
    id: 'matthew',
    name: 'Matthew',
    testament: 'new',
    category: 'gospels',
    chapters: 28,
    description: 'Jesus\' life, teachings, and the foundation of Christian faith.',
    recommended: true,
    difficulty: 'beginner',
    familyFriendly: true,
    estimatedTime: 10
  },
  
  // INTERMEDIATE EXPLORATIONS
  {
    id: 'proverbs',
    name: 'Proverbs',
    testament: 'old',
    category: 'wisdom',
    chapters: 31,
    description: 'Practical wisdom for daily life, perfect for fathers seeking guidance.',
    recommended: true,
    difficulty: 'intermediate',
    familyFriendly: true,
    estimatedTime: 6
  },
  {
    id: 'ephesians',
    name: 'Ephesians',
    testament: 'new',
    category: 'epistles',
    chapters: 6,
    description: 'Paul\'s letter about unity, love, and spiritual armor for the family.',
    recommended: true,
    difficulty: 'intermediate',
    familyFriendly: true,
    estimatedTime: 8
  },
  
  // ADVANCED STUDIES
  {
    id: 'romans',
    name: 'Romans',
    testament: 'new',
    category: 'epistles',
    chapters: 16,
    description: 'Paul\'s deep theological masterpiece on grace, faith, and salvation.',
    recommended: false,
    difficulty: 'advanced',
    familyFriendly: true,
    estimatedTime: 12
  },
  {
    id: 'revelation',
    name: 'Revelation',
    testament: 'new',
    category: 'revelation',
    chapters: 22,
    description: 'John\'s vision of the end times and God\'s ultimate victory.',
    recommended: false,
    difficulty: 'advanced',
    familyFriendly: false,
    estimatedTime: 15
  }
]

// 🎯 LEARNING PROGRESSION PATHS
export const LEARNING_PATHS = {
  'new-to-faith': ['genesis', 'psalms', 'matthew', 'proverbs'],
  'family-focus': ['psalms', 'proverbs', 'ephesians', 'matthew'],
  'deep-study': ['genesis', 'romans', 'ephesians', 'revelation'],
  'quick-wins': ['psalms', 'proverbs', 'ephesians'] // Shorter books for busy dads
} as const

export type LearningPath = keyof typeof LEARNING_PATHS

// 🎯 CONTENT GENERATION HELPERS
export function getRecommendedBooksForPath(path: LearningPath): BibleBook[] {
  const bookIds = LEARNING_PATHS[path]
  return RECOMMENDED_BOOKS.filter(book => 
    bookIds.includes(book.id as 'genesis' | 'psalms' | 'matthew' | 'proverbs' | 'ephesians' | 'romans' | 'revelation')
  )
}

export function getBooksByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): BibleBook[] {
  return RECOMMENDED_BOOKS.filter(book => book.difficulty === difficulty)
}

export function getFamilyFriendlyBooks(): BibleBook[] {
  return RECOMMENDED_BOOKS.filter(book => book.familyFriendly)
}

export function getQuickReadBooks(): BibleBook[] {
  return RECOMMENDED_BOOKS.filter(book => book.estimatedTime <= 6)
}

// 🎯 SMART RECOMMENDATION ENGINE
export function getPersonalizedRecommendations(userProfile: {
  experience: 'new' | 'growing' | 'mature'
  timeAvailable: 'short' | 'medium' | 'long'
  familyStage: 'new-dad' | 'young-kids' | 'teens' | 'empty-nest'
  interests: string[]
}): BibleBook[] {
  let recommendations = [...RECOMMENDED_BOOKS]
  
  // Filter by experience level
  if (userProfile.experience === 'new') {
    recommendations = recommendations.filter(book => book.difficulty === 'beginner')
  } else if (userProfile.experience === 'mature') {
    recommendations = recommendations.filter(book => book.difficulty !== 'beginner')
  }
  
  // Filter by time available
  if (userProfile.timeAvailable === 'short') {
    recommendations = recommendations.filter(book => book.estimatedTime <= 6)
  }
  
  // Filter by family stage
  if (userProfile.familyStage === 'new-dad') {
    recommendations = recommendations.filter(book => 
      book.id === 'psalms' || book.id === 'proverbs' || book.id === 'ephesians'
    )
  }
  
  return recommendations.slice(0, 6) // Top 6 recommendations
}
