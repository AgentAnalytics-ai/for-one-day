/**
 * 📖 Reflection Verse Generator
 * Ties reflection verses to Turn the Page reading assignments
 * Falls back to curated verses if chapter doesn't have a key verse
 */

import { getTodaysBibleReading, type BibleReadingAssignment } from '@/lib/bible-reading-plan'
import { getTodaysVerse, type DailyVerse } from '@/lib/daily-verses'

/**
 * Key verses from common Bible chapters
 * These are meaningful verses that work well for reflection
 */
const CHAPTER_KEY_VERSES: { [key: string]: DailyVerse } = {
  // Genesis
  'genesis-1': {
    reference: 'Genesis 1:27',
    text: 'So God created man in his own image, in the image of God he created him; male and female he created them.',
    prompt: 'How does knowing you are made in God\'s image change how you see yourself and others?',
    theme: 'identity'
  },
  'genesis-12': {
    reference: 'Genesis 12:1',
    text: 'Now the Lord said to Abram, "Go from your country and your kindred and your father\'s house to the land that I will show you."',
    prompt: 'What is God calling you to step out in faith toward, even if it means leaving comfort?',
    theme: 'faith'
  },
  // Exodus
  'exodus-12': {
    reference: 'Exodus 12:13',
    text: 'The blood shall be a sign for you, on the houses where you are. And when I see the blood, I will pass over you, and no plague will befall you to destroy you, when I strike the land of Egypt.',
    prompt: 'How does God\'s protection and deliverance in your past give you confidence for today?',
    theme: 'deliverance'
  },
  'exodus-20': {
    reference: 'Exodus 20:3',
    text: 'You shall have no other gods before me.',
    prompt: 'What "other gods" (idols, priorities, desires) are competing for first place in your life?',
    theme: 'worship'
  },
  // Psalms
  'psalms-1': {
    reference: 'Psalm 1:2',
    text: 'But his delight is in the law of the Lord, and on his law he meditates day and night.',
    prompt: 'What does it look like for you to delight in God\'s Word today?',
    theme: 'meditation'
  },
  'psalms-23': {
    reference: 'Psalm 23:1',
    text: 'The Lord is my shepherd; I shall not want.',
    prompt: 'How have you experienced God as your shepherd, providing what you truly need?',
    theme: 'provision'
  },
  'psalms-78': {
    reference: 'Psalm 78:4',
    text: 'We will not hide them from their children, but tell to the coming generation the glorious deeds of the Lord, and his might, and the wonders that he has done.',
    prompt: 'What story of God\'s faithfulness in your life have you not shared yet?',
    theme: 'testimony'
  },
  // Proverbs
  'proverbs-3': {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    prompt: 'Where are you leaning on your own understanding instead of trusting God?',
    theme: 'trust'
  },
  // Matthew
  'matthew-5': {
    reference: 'Matthew 5:16',
    text: 'In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.',
    prompt: 'How can you let your light shine today in a way that points others to God?',
    theme: 'witness'
  },
  'matthew-6': {
    reference: 'Matthew 6:33',
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    prompt: 'What are you seeking first today? How can you prioritize God\'s kingdom?',
    theme: 'priorities'
  },
  // John
  'john-3': {
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    prompt: 'How does God\'s love for you change how you love others today?',
    theme: 'love'
  },
  // Romans
  'romans-8': {
    reference: 'Romans 8:28',
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    prompt: 'How have you seen God work difficult circumstances for good in your life?',
    theme: 'providence'
  },
  // 1 Corinthians
  '1-corinthians-13': {
    reference: '1 Corinthians 13:4',
    text: 'Love is patient and kind; love does not envy or boast; it is not arrogant or rude.',
    prompt: 'How can you show patient, kind love to someone today?',
    theme: 'love'
  },
  // Ephesians
  'ephesians-2': {
    reference: 'Ephesians 2:8-9',
    text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.',
    prompt: 'How does understanding salvation as a gift change how you relate to God and others?',
    theme: 'grace'
  },
  // Philippians
  'philippians-4': {
    reference: 'Philippians 4:13',
    text: 'I can do all things through him who strengthens me.',
    prompt: 'What challenge are you facing that requires God\'s strength rather than your own?',
    theme: 'strength'
  }
}

/**
 * Get a reflection verse tied to today's Bible reading
 * If the chapter has a key verse, use it. Otherwise, fall back to curated daily verse
 */
export function getReflectionVerseForReading(reading: BibleReadingAssignment): DailyVerse {
  // Create key for lookup (e.g., "exodus-12")
  const bookKey = reading.book.toLowerCase().replace(/\s+/g, '-')
  const chapterKey = `${bookKey}-${reading.chapter}`
  
  // Check if we have a key verse for this chapter
  const keyVerse = CHAPTER_KEY_VERSES[chapterKey]
  
  if (keyVerse) {
    // Use the key verse but enhance the prompt to reference the reading
    return {
      ...keyVerse,
      prompt: `${keyVerse.prompt} (Based on ${reading.book} ${reading.chapter})`
    }
  }
  
  // Fall back to curated daily verse, but reference the reading in the prompt
  const dailyVerse = getTodaysVerse()
  return {
    ...dailyVerse,
    prompt: `${dailyVerse.prompt} (You just read ${reading.book} ${reading.chapter} - how does today's verse connect to what you read?)`
  }
}

/**
 * Get today's reflection verse (tied to Turn the Page reading)
 */
export function getTodaysReflectionVerse(): DailyVerse {
  const todayReading = getTodaysBibleReading()
  return getReflectionVerseForReading(todayReading)
}
