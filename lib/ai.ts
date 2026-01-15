import OpenAI from 'openai'

/**
 * 🤖 OpenAI client and prompts for For One Day
 */

export const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

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
  if (!openai) {
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
7. A "Blessing" card - a 2-3 sentence blessing that can be read over the family (inclusive, not gender-specific)

Return ONLY valid JSON array with NO additional text:
[
  {"type": "prompt", "text": "What was the best part of your week?", "category": "reflection"},
  {"type": "guess", "text": "Who wrote: 'I felt...'", "options": ["Parent 1", "Parent 2", "Sarah"], "answer": "Parent 1"},
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
  if (!openai) {
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
 * Generate a complete daily devotional with scripture and prompts
 */
export async function generateDevotional(params: {
  date: string
  theme?: string
  userId: string
}): Promise<{
  slug: string
  title: string
  description: string
  scripture: { ref: string; text: string }
  day_prompts: string[]
} | null> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const date = new Date(params.date)
  const dayOfWeek = date.getDay()
  const isSunday = dayOfWeek === 0

  // Skip Sunday (Table Talk day)
  if (isSunday) {
    return null
  }

  const themes = [
    'Gratitude and Thankfulness',
    'Faith and Trust',
    'Love and Family',
    'Wisdom and Guidance',
    'Strength and Courage',
    'Peace and Rest'
  ]

  const scriptures = [
    { ref: '1 Thessalonians 5:18', text: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.' },
    { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
    { ref: '1 Corinthians 13:4-7', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.' },
    { ref: 'Proverbs 22:6', text: 'Start children off on the way they should go, and even when they are old they will not turn from it.' },
    { ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
    { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' }
  ]

  // Use date-based selection for consistency
  const themeIndex = date.getDate() % themes.length
  const scriptureIndex = date.getDate() % scriptures.length
  
  const selectedTheme = themes[themeIndex]
  const selectedScripture = scriptures[scriptureIndex]

  const prompt = `Create a daily devotional focused on ${selectedTheme}. This is for an inclusive app used by people of all backgrounds (not gender-specific).

Scripture: ${selectedScripture.text} (${selectedScripture.ref})

Create:
1. A compelling title (3-5 words)
2. A brief description (1-2 sentences)
3. Six daily reflection prompts (Monday-Saturday) that connect to the scripture and theme

Each prompt should be:
- Personal and introspective
- Relevant to family, relationships, and legacy (inclusive, not gender-specific)
- 1-2 sentences long
- Encouraging and thought-provoking
- Accessible to all users regardless of gender or family structure

Return as JSON:
{
  "title": "Title here",
  "description": "Description here",
  "day_prompts": [
    "Monday prompt...",
    "Tuesday prompt...",
    "Wednesday prompt...",
    "Thursday prompt...",
    "Friday prompt...",
    "Saturday prompt..."
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)
    
    const slug = `${selectedTheme.toLowerCase().replace(/\s+/g, '-')}-${date.toISOString().split('T')[0]}`
    
    return {
      slug,
      title: parsed.title || selectedTheme,
      description: parsed.description || `A devotional on ${selectedTheme}`,
      scripture: selectedScripture,
      day_prompts: parsed.day_prompts || [
        'What does this scripture mean to you personally?',
        'How can you apply this truth in your relationships today?',
        'What challenges does this address in your life?',
        'How has God shown this truth to you recently?',
        'What would you want your loved ones to learn from this?',
        'How does this scripture encourage you for tomorrow?'
      ]
    }
  } catch (error) {
    console.error('Error generating devotional:', error)
    return null
  }
}

/**
 * Generate a daily devotional based on theme and scripture (legacy function)
 */
export async function generateDevotionalReflection(
  theme: string,
  scripture: { ref: string; text: string }
): Promise<{ reflection: string; prompt: string }> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `Create a brief daily devotional. This is for an inclusive app used by people of all backgrounds (not gender-specific).

Theme: ${theme}
Scripture: ${scripture.text} (${scripture.ref})

Write:
1. A 200-word reflection connecting the scripture to family, relationships, and legacy (inclusive, not gender-specific)
2. One thoughtful journal prompt question

Use a gentle, purposeful, encouraging tone that is accessible to all users. Return as JSON:
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

/**
 * 📖 Turn the Page Challenge - AI-Powered Bible Photo Analysis
 * Analyzes Bible photos, extracts text, and connects verse + photo + reflection
 * Uses OpenAI Vision API (gpt-4o) for expert-level analysis
 */
export interface TurnThePageAnalysis {
  // Text extracted from photo
  extractedText: {
    bibleVerse?: string  // Verse text found in photo
    handwrittenNotes?: string  // Handwritten notes/jottings
    printedText?: string  // Any other printed text
  }
  
  // AI insights connecting everything
  insights: {
    summary: string  // "On this day, you took a photo of [verse] and jotted down [notes]..."
    connections: string  // How verse + photo + reflection connect
    themes: string[]  // Key themes identified
    personalGrowth: string  // Growth insights
  }
  
  // Visual analysis
  photoDescription: string  // What's in the photo
  verseMatch: {
    found: boolean
    confidence: number
    matchedVerse?: string
  }
}

export async function analyzeTurnThePagePhoto(params: {
  imageUrl: string  // Signed URL or base64
  verse: { ref: string; text: string }  // Today's verse
  reflection: string  // User's written reflection
}): Promise<TurnThePageAnalysis | null> {
  if (!openai) {
    console.warn('OpenAI not configured, cannot analyze Bible photo')
    return null
  }

  try {
    const prompt = `You are analyzing a photo of a Bible page for the "Turn the Page Challenge" - a daily habit where users photograph Bible pages and reflect on them.

CONTEXT:
- Today's Verse: "${params.verse.text}" (${params.verse.ref})
- User's Reflection: "${params.reflection}"

TASKS:
1. Extract ALL text from the photo:
   - Bible verse text (printed in Bible)
   - Handwritten notes/jottings (if any)
   - Any other printed text

2. Analyze the connection:
   - Does the photo show today's verse or a related verse?
   - What did the user write/note in the photo?
   - How does the photo connect to their written reflection?
   - What themes emerge from verse + photo + reflection?

3. Generate insights:
   - A summary: "On this day, you took a photo of [verse] and jotted down [notes]. Based on what you read and what you wrote..."
   - Connections between verse, photo, and reflection
   - Key themes
   - Personal growth insights

Return as JSON:
{
  "extractedText": {
    "bibleVerse": "Verse text found in photo (if any)",
    "handwrittenNotes": "Handwritten notes/jottings (if any)",
    "printedText": "Other printed text (if any)"
  },
  "insights": {
    "summary": "On this day, you took a photo of [verse] and jotted down [notes]. Based on what you read and what you wrote, [insight]...",
    "connections": "How the verse, photo, and reflection connect...",
    "themes": ["theme1", "theme2"],
    "personalGrowth": "Growth insight based on all three elements..."
  },
  "photoDescription": "What's visible in the photo",
  "verseMatch": {
    "found": true/false,
    "confidence": 0.0-1.0,
    "matchedVerse": "Verse reference if found"
  }
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',  // Use gpt-4o for vision capabilities
      messages: [
        {
          role: 'system',
          content: 'You are a biblical scholar and spiritual counselor analyzing Bible photos for the "Turn the Page Challenge". Provide meaningful insights that connect scripture, visual elements, and personal reflection. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: params.imageUrl
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 1000
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)
    
    return {
      extractedText: {
        bibleVerse: parsed.extractedText?.bibleVerse || '',
        handwrittenNotes: parsed.extractedText?.handwrittenNotes || '',
        printedText: parsed.extractedText?.printedText || ''
      },
      insights: {
        summary: parsed.insights?.summary || '',
        connections: parsed.insights?.connections || '',
        themes: parsed.insights?.themes || [],
        personalGrowth: parsed.insights?.personalGrowth || ''
      },
      photoDescription: parsed.photoDescription || '',
      verseMatch: {
        found: parsed.verseMatch?.found || false,
        confidence: parsed.verseMatch?.confidence || 0,
        matchedVerse: parsed.verseMatch?.matchedVerse
      }
    }
  } catch (error) {
    console.error('Error analyzing Turn the Page Challenge photo:', error)
    return null
  }
}

