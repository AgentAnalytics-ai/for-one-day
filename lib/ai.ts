import OpenAI from 'openai'
import { env } from '@/lib/env'

/**
 * 🤖 OpenAI client and prompts for For One Day
 */

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
})

export interface DevotionEntry {
  day_index: number
  note: string
  created_at: string
}

export interface TableTalkCard {
  type: 'prompt' | 'guess' | 'verse' | 'blessing'
  text: string
  options?: string[]
  answer?: string
  category?: string
}

/**
 * Generate a Table Talk deck from weekly devotion entries
 */
export async function generateTableTalkDeck(
  entries: DevotionEntry[]
): Promise<TableTalkCard[]> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `You are creating a wholesome family table game for Sunday dinner.

Based on these devotional journal entries from Monday-Saturday, create exactly 7 cards:

ENTRIES:
${entries.map(e => `Day ${e.day_index}: ${e.note}`).join('\n')}

CREATE THESE 7 CARDS:
1. A "Prompt" card asking an open-ended question about someone's week
2. A "Prompt" card about gratitude or growth  
3. A "Prompt" card connecting to the devotional theme
4. A "Guess" card where family guesses who wrote which entry
5. A "Guess" card about which day something happened
6. A "Verse Recall" card with a fill-in-the-blank from scripture (keep it simple)
7. A "Blessing" card - a 2-3 sentence blessing the father can read over the family

Return ONLY valid JSON array with NO additional text:
[
  {"type": "prompt", "text": "What was the best part of your week?", "category": "reflection"},
  {"type": "guess", "text": "Who wrote: 'I felt...'", "options": ["Dad", "Mom", "Sarah"], "answer": "Dad"},
  {"type": "verse", "text": "'Be strong and ___' - Joshua 1:9", "answer": "courageous"},
  {"type": "blessing", "text": "Your blessing here..."}
]`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  try {
    const content = completion.choices[0].message.content || '{}'
    // Try to extract array if wrapped in object
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : parsed.cards || []
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return []
  }
}

/**
 * Generate a weekly summary from devotion entries
 */
export async function generateWeeklySummary(
  entries: DevotionEntry[]
): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `Summarize this week's devotional journey in 150-200 words.
Focus on themes of growth, gratitude, and family connections.
End with one actionable insight for next week.
Use a warm, encouraging tone.

Entries:
${entries.map(e => `Day ${e.day_index}: ${e.note}`).join('\n\n')}
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  })

  return completion.choices[0].message.content || ''
}

/**
 * Generate a daily devotional based on theme and scripture
 */
export async function generateDevotional(
  theme: string,
  scripture: { ref: string; text: string }
): Promise<{ reflection: string; prompt: string }> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `Create a brief daily devotional for fathers.

Theme: ${theme}
Scripture: ${scripture.text} (${scripture.ref})

Write:
1. A 200-word reflection connecting the scripture to fatherhood, family, and legacy
2. One thoughtful journal prompt question

Use a gentle, purposeful, fatherly tone. Return as JSON:
{"reflection": "...", "prompt": "..."}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content || '{}'
  const parsed = JSON.parse(content)
  
  return {
    reflection: parsed.reflection || '',
    prompt: parsed.prompt || '',
  }
}

