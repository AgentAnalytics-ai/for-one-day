/**
 * 📖 Verse Enhancement System - Pro Feature
 * Uses AI to provide deep verse explanations and psychology-based reflection prompts
 * Based on 2026 best practices for journaling and spiritual growth
 */

import { openai } from './ai'

export interface VerseExplanation {
  context: string        // Historical/situational context
  meaning: string        // What the verse is saying
  keyWords: string[]     // Important words to understand
  crossReferences?: string[]  // Related verses
}

export interface VersePrompts {
  understanding: string  // "What is this verse saying about [theme]?"
  application: string    // "How does this apply to your life today?"
  reflection: string     // "Where have you seen this truth in your life?"
  gratitude?: string    // "What are you grateful for related to this?"
  action?: string       // "What's one way you can live this out?"
  quick?: string        // "One sentence: How does this apply?"
}

export interface EnhancedVerse {
  reference: string
  text: string
  theme: string
  explanation: VerseExplanation
  prompts: VersePrompts
}

/**
 * Enhance a verse with AI-powered explanation and psychology-based prompts
 * Uses Meta-level principles: understanding → application → reflection → action
 */
export async function enhanceVerse(verse: {
  reference: string
  text: string
  theme: string
}): Promise<EnhancedVerse | null> {
  if (!openai) {
    console.warn('OpenAI not configured, cannot enhance verse')
    return null
  }

  try {
    const prompt = `You are a biblical scholar and Christian counselor with expertise in spiritual formation and journaling psychology. Your goal is to help people deeply understand Scripture and apply it to their lives.

VERSE TO ENHANCE:
Reference: ${verse.reference}
Text: "${verse.text}"
Theme: ${verse.theme}

Provide a comprehensive enhancement following these principles:

1. EXPLANATION (Help them understand):
   - CONTEXT: 2-3 sentences about when/why this was written, the historical situation, or the audience
   - MEANING: 2-3 sentences explaining what this verse is actually saying in plain language
   - KEY WORDS: 3-5 important words from the verse that are crucial to understanding
   - CROSS REFERENCES: 2-3 related verses (format: "Book Chapter:Verse")

2. PROMPTS (Psychology-based reflection questions):
   Use these principles from 2026 journaling psychology:
   - Start with UNDERSTANDING (cognitive engagement - help them grasp the meaning)
   - Then APPLICATION (behavioral - how does this apply to life)
   - Then REFLECTION (emotional - where have they seen this)
   - Then GRATITUDE (positive psychology - what are they thankful for)
   - Then ACTION (motivation - what can they do)
   - Then QUICK (reduced friction - one sentence version)

   Make each prompt:
   - Short and clear (one question, max 15 words)
   - Positive and encouraging (start with what's good, not failures)
   - Inclusive (work for all life stages, not just fathers/mothers)
   - Actionable but not overwhelming
   - Personal ("you" not "we")

Return ONLY valid JSON (no markdown, no code blocks):
{
  "explanation": {
    "context": "2-3 sentences about historical context...",
    "meaning": "2-3 sentences explaining what this verse means...",
    "keyWords": ["word1", "word2", "word3"],
    "crossReferences": ["Book 1:1", "Book 2:2"]
  },
  "prompts": {
    "understanding": "One clear question about understanding the verse",
    "application": "One clear question about applying it to life",
    "reflection": "One clear question about reflecting on personal experience",
    "gratitude": "One clear question about gratitude related to this theme",
    "action": "One clear question about taking action",
    "quick": "One sentence version for quick reflection"
  }
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a biblical scholar and Christian counselor. Always return valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)
    
    return {
      reference: verse.reference,
      text: verse.text,
      theme: verse.theme,
      explanation: {
        context: parsed.explanation?.context || '',
        meaning: parsed.explanation?.meaning || '',
        keyWords: parsed.explanation?.keyWords || [],
        crossReferences: parsed.explanation?.crossReferences || []
      },
      prompts: {
        understanding: parsed.prompts?.understanding || '',
        application: parsed.prompts?.application || '',
        reflection: parsed.prompts?.reflection || '',
        gratitude: parsed.prompts?.gratitude || '',
        action: parsed.prompts?.action || '',
        quick: parsed.prompts?.quick || ''
      }
    }
  } catch (error) {
    console.error('Error enhancing verse:', error)
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}

/**
 * Get cached enhanced verse or generate new one
 * Pro users get enhanced, free users get basic
 */
export async function getEnhancedVerse(
  verse: {
    reference: string
    text: string
    theme: string
  },
  isPro: boolean
): Promise<EnhancedVerse | null> {
  if (!isPro) {
    // Free users get basic version
    return null
  }

  // For Pro users, enhance with AI
  return await enhanceVerse(verse)
}

