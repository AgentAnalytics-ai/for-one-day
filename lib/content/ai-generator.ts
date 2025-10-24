/**
 * 🤖 AI Content Generator - Premium Devotional System
 * Expert-validated AI prompts for father-focused content
 */

import { openai } from '@/lib/ai'
import { BibleBook, DevotionalContent } from './bible-library'

/**
 * 🎯 EXPERT-OPTIMIZED AI PROMPTS
 * Tested and refined for maximum engagement and spiritual depth
 */

const DEVOTIONAL_PROMPT = `
You are a wise, experienced pastor writing a 3-minute devotional specifically for busy fathers. 

CONTEXT:
- Book: {bookName}
- Chapter: {chapterNumber}
- Key themes: {themes}
- Father's time: Limited but precious
- Goal: Spiritual growth + family connection

REQUIREMENTS:
1. Title: Catchy, father-relevant (8-12 words)
2. Summary: 150-200 words, conversational tone
3. Reflection: 3 questions that help fathers apply the text to their daily life
4. Prayer: Short, honest prayer prompt (not formal)
5. Family Action: One simple way to share this with family today
6. Tone: Encouraging, practical, authentic (not preachy)

FORMAT:
Title: [Title here]
Summary: [Summary here]
Reflection Questions:
1. [Question 1]
2. [Question 2] 
3. [Question 3]
Prayer: [Prayer prompt]
Family Action: [Action step]

Make this feel like a conversation with a trusted friend who understands the challenges of fatherhood.
`

const TABLE_TALK_PROMPT = `
You are creating family discussion questions based on {bookName} chapter {chapterNumber}.

CONTEXT:
- Family dinner table conversation
- Ages: Mixed (kids + teens)
- Goal: Meaningful connection, not lecture
- Duration: 10-15 minutes max

REQUIREMENTS:
Generate 7 questions (one for each day of the week) that:
1. Are age-appropriate for mixed families
2. Connect the Bible text to everyday life
3. Encourage sharing and listening
4. Build family bonds
5. Are fun and engaging (not academic)

FORMAT:
Monday: [Question about the text]
Tuesday: [Question about family life]
Wednesday: [Question about character/values]
Thursday: [Question about challenges]
Friday: [Question about gratitude/blessings]
Saturday: [Question about relationships]
Sunday: [Question about faith/growth]

Make questions that kids will actually want to answer and parents will enjoy discussing.
`

const SUMMARY_PROMPT = `
Summarize {bookName} chapter {chapterNumber} in 2-3 sentences for a busy father who wants to understand the main point quickly.

Focus on:
- The core message
- How it applies to fatherhood/family life
- Any practical wisdom

Keep it conversational and relevant.
`

/**
 * 🎯 AI CONTENT GENERATION FUNCTIONS
 */

export async function generateDevotional(
  book: BibleBook, 
  chapterNumber: number, 
  themes: string[]
): Promise<DevotionalContent> {
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  try {
    const prompt = DEVOTIONAL_PROMPT
      .replace('{bookName}', book.name)
      .replace('{chapterNumber}', chapterNumber.toString())
      .replace('{themes}', themes.join(', '))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a wise pastor writing devotionals for busy fathers. Be authentic, practical, and encouraging.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Parse the structured response
    const lines = content.split('\n')
    const title = lines.find(line => line.startsWith('Title:'))?.replace('Title:', '').trim() || ''
    const summary = lines.find(line => line.startsWith('Summary:'))?.replace('Summary:', '').trim() || ''
    
    const reflectionLines = lines.filter(line => line.match(/^\d+\./))
    const reflectionQuestions = reflectionLines.map(line => line.replace(/^\d+\.\s*/, ''))
    
    const prayer = lines.find(line => line.startsWith('Prayer:'))?.replace('Prayer:', '').trim() || ''
    const familyAction = lines.find(line => line.startsWith('Family Action:'))?.replace('Family Action:', '').trim() || ''

    return {
      id: `${book.id}-${chapterNumber}-${Date.now()}`,
      bookId: book.id,
      chapterNumber,
      title,
      summary,
      reflectionQuestions,
      prayerPrompt: prayer,
      familyAction,
      relatedVerses: [], // Could be populated with related verse suggestions
      estimatedTime: 3,
      difficulty: book.difficulty
    }
  } catch (error) {
    console.error('Error generating devotional:', error)
    throw new Error('Failed to generate devotional content')
  }
}

export async function generateTableTalkQuestions(
  book: BibleBook,
  chapterNumber: number
): Promise<string[]> {
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  try {
    const prompt = TABLE_TALK_PROMPT
      .replace('{bookName}', book.name)
      .replace('{chapterNumber}', chapterNumber.toString())

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are creating fun, engaging family discussion questions. Make them age-appropriate and conversation-starting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.8
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Parse the 7 daily questions
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const questions: string[] = []
    
    days.forEach(day => {
      const dayLine = content.split('\n').find(line => line.startsWith(`${day}:`))
      if (dayLine) {
        questions.push(dayLine.replace(`${day}:`, '').trim())
      }
    })

    return questions.length === 7 ? questions : []
  } catch (error) {
    console.error('Error generating table talk questions:', error)
    return []
  }
}

export async function generateChapterSummary(
  book: BibleBook,
  chapterNumber: number
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  try {
    const prompt = SUMMARY_PROMPT
      .replace('{bookName}', book.name)
      .replace('{chapterNumber}', chapterNumber.toString())

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are summarizing Bible chapters for busy fathers. Be concise and practical.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.6
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating chapter summary:', error)
    return ''
  }
}

/**
 * 🎯 CONTENT OPTIMIZATION HELPERS
 */

export function optimizeForReadingTime(content: string, targetMinutes: number): string {
  // Estimate reading time: ~200 words per minute
  const wordsPerMinute = 200
  const targetWords = targetMinutes * wordsPerMinute
  const currentWords = content.split(' ').length
  
  if (currentWords <= targetWords) {
    return content
  }
  
  // Truncate to target length while preserving sentences
  const sentences = content.split('. ')
  let result = ''
  let wordCount = 0
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.split(' ').length
    if (wordCount + sentenceWords <= targetWords) {
      result += (result ? '. ' : '') + sentence
      wordCount += sentenceWords
    } else {
      break
    }
  }
  
  return result + (result.endsWith('.') ? '' : '.')
}

export function addPersonalizationHooks(content: string, userProfile: {
  name?: string
  familyStage?: string
  interests?: string[]
}): string {
  let personalizedContent = content
  
  if (userProfile.name) {
    personalizedContent = personalizedContent.replace(/father/g, userProfile.name)
  }
  
  if (userProfile.familyStage === 'new-dad') {
    personalizedContent = personalizedContent.replace(/family/g, 'your growing family')
  }
  
  return personalizedContent
}
