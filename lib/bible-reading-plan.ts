/**
 * 📖 Bible Reading Plan Calculator
 * Maps day numbers (1-730) to Bible book/chapter assignments
 * Simple, clean implementation for 2-year reading plan
 */

export interface BibleReadingAssignment {
  dayNumber: number
  book: string
  chapter: number
  bookAbbreviation: string
}

export interface ReadingProgress {
  currentDay: number
  totalDays: number
  percentage: number
  currentBook: string
  currentChapter: number
  daysRemaining: number
}

/**
 * Complete Bible structure - 66 books with chapter counts
 * Total: 1189 chapters
 * For 730 days: ~1.63 chapters per day
 * Strategy: One chapter per day, some days may have 2 chapters for shorter books
 */
const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', abbrev: 'Gen', chapters: 50 },
  { name: 'Exodus', abbrev: 'Ex', chapters: 40 },
  { name: 'Leviticus', abbrev: 'Lev', chapters: 27 },
  { name: 'Numbers', abbrev: 'Num', chapters: 36 },
  { name: 'Deuteronomy', abbrev: 'Deut', chapters: 34 },
  { name: 'Joshua', abbrev: 'Josh', chapters: 24 },
  { name: 'Judges', abbrev: 'Judg', chapters: 21 },
  { name: 'Ruth', abbrev: 'Ruth', chapters: 4 },
  { name: '1 Samuel', abbrev: '1 Sam', chapters: 31 },
  { name: '2 Samuel', abbrev: '2 Sam', chapters: 24 },
  { name: '1 Kings', abbrev: '1 Kgs', chapters: 22 },
  { name: '2 Kings', abbrev: '2 Kgs', chapters: 25 },
  { name: '1 Chronicles', abbrev: '1 Chr', chapters: 29 },
  { name: '2 Chronicles', abbrev: '2 Chr', chapters: 36 },
  { name: 'Ezra', abbrev: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', abbrev: 'Neh', chapters: 13 },
  { name: 'Esther', abbrev: 'Esth', chapters: 10 },
  { name: 'Job', abbrev: 'Job', chapters: 42 },
  { name: 'Psalms', abbrev: 'Ps', chapters: 150 },
  { name: 'Proverbs', abbrev: 'Prov', chapters: 31 },
  { name: 'Ecclesiastes', abbrev: 'Eccl', chapters: 12 },
  { name: 'Song of Songs', abbrev: 'Song', chapters: 8 },
  { name: 'Isaiah', abbrev: 'Isa', chapters: 66 },
  { name: 'Jeremiah', abbrev: 'Jer', chapters: 52 },
  { name: 'Lamentations', abbrev: 'Lam', chapters: 5 },
  { name: 'Ezekiel', abbrev: 'Ezek', chapters: 48 },
  { name: 'Daniel', abbrev: 'Dan', chapters: 12 },
  { name: 'Hosea', abbrev: 'Hos', chapters: 14 },
  { name: 'Joel', abbrev: 'Joel', chapters: 3 },
  { name: 'Amos', abbrev: 'Amos', chapters: 9 },
  { name: 'Obadiah', abbrev: 'Obad', chapters: 1 },
  { name: 'Jonah', abbrev: 'Jonah', chapters: 4 },
  { name: 'Micah', abbrev: 'Mic', chapters: 7 },
  { name: 'Nahum', abbrev: 'Nah', chapters: 3 },
  { name: 'Habakkuk', abbrev: 'Hab', chapters: 3 },
  { name: 'Zephaniah', abbrev: 'Zeph', chapters: 3 },
  { name: 'Haggai', abbrev: 'Hag', chapters: 2 },
  { name: 'Zechariah', abbrev: 'Zech', chapters: 14 },
  { name: 'Malachi', abbrev: 'Mal', chapters: 4 },
  // New Testament
  { name: 'Matthew', abbrev: 'Matt', chapters: 28 },
  { name: 'Mark', abbrev: 'Mark', chapters: 23 },
  { name: 'Luke', abbrev: 'Luke', chapters: 24 },
  { name: 'John', abbrev: 'John', chapters: 21 },
  { name: 'Acts', abbrev: 'Acts', chapters: 28 },
  { name: 'Romans', abbrev: 'Rom', chapters: 16 },
  { name: '1 Corinthians', abbrev: '1 Cor', chapters: 16 },
  { name: '2 Corinthians', abbrev: '2 Cor', chapters: 13 },
  { name: 'Galatians', abbrev: 'Gal', chapters: 6 },
  { name: 'Ephesians', abbrev: 'Eph', chapters: 6 },
  { name: 'Philippians', abbrev: 'Phil', chapters: 4 },
  { name: 'Colossians', abbrev: 'Col', chapters: 4 },
  { name: '1 Thessalonians', abbrev: '1 Thess', chapters: 5 },
  { name: '2 Thessalonians', abbrev: '2 Thess', chapters: 3 },
  { name: '1 Timothy', abbrev: '1 Tim', chapters: 6 },
  { name: '2 Timothy', abbrev: '2 Tim', chapters: 4 },
  { name: 'Titus', abbrev: 'Titus', chapters: 3 },
  { name: 'Philemon', abbrev: 'Phlm', chapters: 1 },
  { name: 'Hebrews', abbrev: 'Heb', chapters: 13 },
  { name: 'James', abbrev: 'James', chapters: 5 },
  { name: '1 Peter', abbrev: '1 Pet', chapters: 5 },
  { name: '2 Peter', abbrev: '2 Pet', chapters: 3 },
  { name: '1 John', abbrev: '1 John', chapters: 5 },
  { name: '2 John', abbrev: '2 John', chapters: 1 },
  { name: '3 John', abbrev: '3 John', chapters: 1 },
  { name: 'Jude', abbrev: 'Jude', chapters: 1 },
  { name: 'Revelation', abbrev: 'Rev', chapters: 22 },
] as const

const TOTAL_CHAPTERS = 1189
const TOTAL_DAYS = 730

/**
 * Calculate which book/chapter corresponds to a given day number
 * Strategy: Distribute 1189 chapters across 730 days evenly
 * Formula: targetChapter = ceil(dayNumber * 1189 / 730)
 * Then map that chapter number to the correct book/chapter
 */
export function getBibleReadingAssignment(dayNumber: number): BibleReadingAssignment {
  if (dayNumber < 1 || dayNumber > TOTAL_DAYS) {
    // Default to Genesis 1 if out of range
    return {
      dayNumber: 1,
      book: 'Genesis',
      chapter: 1,
      bookAbbreviation: 'Gen'
    }
  }

  // Calculate which chapter number (out of 1189 total) we're on
  // For day 1: chapter 1, for day 730: chapter 1189
  const targetChapterNumber = Math.ceil((dayNumber / TOTAL_DAYS) * TOTAL_CHAPTERS)
  
  // Find which book/chapter this corresponds to
  let chapterCount = 0
  for (const book of BIBLE_BOOKS) {
    if (chapterCount + book.chapters >= targetChapterNumber) {
      const chapter = targetChapterNumber - chapterCount
      return {
        dayNumber,
        book: book.name,
        chapter: Math.max(1, Math.min(chapter, book.chapters)), // Ensure valid chapter
        bookAbbreviation: book.abbrev
      }
    }
    chapterCount += book.chapters
  }

  // Fallback to last book/chapter
  const lastBook = BIBLE_BOOKS[BIBLE_BOOKS.length - 1]
  return {
    dayNumber,
    book: lastBook.name,
    chapter: lastBook.chapters,
    bookAbbreviation: lastBook.abbrev
  }
}

/**
 * Get today's Bible reading assignment
 * Calculates day number based on a start date (defaults to Jan 1 of current year)
 */
export function getTodaysBibleReading(startDate?: Date): BibleReadingAssignment {
  const start = startDate || new Date(new Date().getFullYear(), 0, 1) // Jan 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const dayNumber = Math.max(1, Math.min(daysSinceStart + 1, TOTAL_DAYS))
  
  return getBibleReadingAssignment(dayNumber)
}

/**
 * Calculate reading progress
 */
export function calculateReadingProgress(
  completedDays: number[],
  startDate?: Date
): ReadingProgress {
  const today = getTodaysBibleReading(startDate)
  const totalDays = TOTAL_DAYS
  const currentDay = today.dayNumber
  const percentage = Math.round((currentDay / totalDays) * 100)
  const daysRemaining = Math.max(0, totalDays - currentDay)

  return {
    currentDay,
    totalDays,
    percentage,
    currentBook: today.book,
    currentChapter: today.chapter,
    daysRemaining
  }
}

/**
 * Get all books in order
 */
export function getAllBibleBooks(): Array<{ name: string; abbrev: string; chapters: number }> {
  return BIBLE_BOOKS.map(book => ({
    name: book.name,
    abbrev: book.abbrev,
    chapters: book.chapters
  }))
}

/**
 * Get book by name
 */
export function getBookByName(bookName: string): { name: string; abbrev: string; chapters: number } | null {
  return BIBLE_BOOKS.find(book => 
    book.name.toLowerCase() === bookName.toLowerCase() ||
    book.abbrev.toLowerCase() === bookName.toLowerCase()
  ) || null
}
