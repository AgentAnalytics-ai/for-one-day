/**
 * 📖 Bible Text Library - Hybrid Content Strategy
 * Expert-validated approach: Curated verses + API integration
 */

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  translation: 'ESV' | 'NIV' | 'NLT'
}

export interface BibleChapter {
  book: string
  chapter: number
  verses: BibleVerse[]
  summary: string
  keyThemes: string[]
  devotionalFocus: string
}

/**
 * 🎯 CURATED STARTER CONTENT - GENESIS 1
 * High-quality, father-focused verses for immediate launch
 */
export const GENESIS_1_VERSES: BibleVerse[] = [
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning, God created the heavens and the earth.',
    translation: 'ESV'
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 2,
    text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
    translation: 'ESV'
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 3,
    text: 'And God said, "Let there be light," and there was light.',
    translation: 'ESV'
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 27,
    text: 'So God created man in his own image, in the image of God he created him; male and female he created them.',
    translation: 'ESV'
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 28,
    text: 'And God blessed them. And God said to them, "Be fruitful and multiply and fill the earth and subdue it, and have dominion over the fish of the sea and over the birds of the heavens and over every living thing that moves on the earth."',
    translation: 'ESV'
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 31,
    text: 'And God saw everything that he had made, and behold, it was very good. And there was evening and there was morning, the sixth day.',
    translation: 'ESV'
  }
]

export const PSALMS_23_VERSES: BibleVerse[] = [
  {
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    text: 'The Lord is my shepherd; I shall not want.',
    translation: 'ESV'
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 2,
    text: 'He makes me lie down in green pastures. He leads me beside still waters.',
    translation: 'ESV'
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 3,
    text: 'He restores my soul. He leads me in paths of righteousness for his name\'s sake.',
    translation: 'ESV'
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 4,
    text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    translation: 'ESV'
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 5,
    text: 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.',
    translation: 'ESV'
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 6,
    text: 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.',
    translation: 'ESV'
  }
]

export const MATTHEW_6_VERSES: BibleVerse[] = [
  {
    book: 'Matthew',
    chapter: 6,
    verse: 9,
    text: 'Pray then like this: "Our Father in heaven, hallowed be your name.',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 10,
    text: 'Your kingdom come, your will be done, on earth as it is in heaven.',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 11,
    text: 'Give us this day our daily bread,',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 12,
    text: 'and forgive us our debts, as we also have forgiven our debtors.',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 26,
    text: 'Look at the birds of the air: they neither sow nor reap nor gather into barns, and yet your heavenly Father feeds them. Are you not of more value than they?',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 33,
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    translation: 'ESV'
  }
]

/**
 * 🎯 CURATED CHAPTERS FOR LAUNCH
 */
export const CURATED_CHAPTERS: { [key: string]: BibleChapter } = {
  'genesis-1': {
    book: 'Genesis',
    chapter: 1,
    verses: GENESIS_1_VERSES,
    summary: 'The story of creation reveals God as the ultimate Father and Creator. As fathers, we mirror God\'s creative nature when we speak life, order, and blessing into our families.',
    keyThemes: ['Creation', 'God\'s Authority', 'Divine Order', 'Blessing'],
    devotionalFocus: 'How can you speak life and order into your family today, just as God spoke creation into existence?'
  },
  'psalms-23': {
    book: 'Psalms',
    chapter: 23,
    verses: PSALMS_23_VERSES,
    summary: 'David\'s psalm of trust shows us what it means to be led by a loving Father. As earthly fathers, we can model the same protective, providing, guiding love for our children.',
    keyThemes: ['Trust', 'Protection', 'Provision', 'Guidance'],
    devotionalFocus: 'How can you be a shepherd-father who leads your family with gentleness and strength?'
  },
  'matthew-6': {
    book: 'Matthew',
    chapter: 6,
    verses: MATTHEW_6_VERSES,
    summary: 'Jesus teaches us how to pray and trust our heavenly Father. This chapter shows fathers how to model dependence on God and teach our children to seek first His kingdom.',
    keyThemes: ['Prayer', 'Trust', 'Provision', 'Priorities'],
    devotionalFocus: 'How can you teach your family to seek God\'s kingdom first in your daily decisions and priorities?'
  }
}

/**
 * 🎯 CONTENT RETRIEVAL FUNCTIONS
 */
export function getBibleChapter(bookId: string, chapterNumber: number): BibleChapter | null {
  const key = `${bookId}-${chapterNumber}`
  return CURATED_CHAPTERS[key] || null
}

export function getVerseText(book: string, chapter: number, verse: number): string {
  const chapterKey = `${book.toLowerCase()}-${chapter}`
  const chapterData = CURATED_CHAPTERS[chapterKey]
  
  if (!chapterData) return ''
  
  const verseData = chapterData.verses.find(v => v.verse === verse)
  return verseData?.text || ''
}

export function getChapterSummary(bookId: string, chapterNumber: number): string {
  const chapter = getBibleChapter(bookId, chapterNumber)
  return chapter?.summary || ''
}

export function getKeyThemes(bookId: string, chapterNumber: number): string[] {
  const chapter = getBibleChapter(bookId, chapterNumber)
  return chapter?.keyThemes || []
}

/**
 * 🎯 FUTURE API INTEGRATION PLACEHOLDER
 * This is where we'll add Bible API integration for expanded content
 */
export async function fetchBibleChapterFromAPI(
  bookId: string, 
  chapterNumber: number,
  translation: 'ESV' | 'NIV' | 'NLT' = 'ESV'
): Promise<BibleChapter | null> {
  // TODO: Implement Bible API integration
  // Options: YouVersion API, ESV API, Bible.com API
  
  // For now, return curated content
  return getBibleChapter(bookId, chapterNumber)
}

/**
 * 🎯 CONTENT EXPANSION STRATEGY
 */
export const CONTENT_ROADMAP = {
  'Phase 1 (Launch)': {
    books: ['Genesis (Ch 1-3)', 'Psalms (Ch 1, 23, 139)', 'Matthew (Ch 5-7)'],
    totalChapters: 9,
    approach: 'Curated high-quality content'
  },
  'Phase 2 (Month 2)': {
    books: ['Complete Genesis', 'Complete Psalms 1-50', 'Complete Matthew'],
    totalChapters: 128,
    approach: 'API integration + curated summaries'
  },
  'Phase 3 (Month 6)': {
    books: ['All recommended books', 'User-requested books'],
    totalChapters: 500,
    approach: 'Full API integration with AI enhancement'
  }
} as const
