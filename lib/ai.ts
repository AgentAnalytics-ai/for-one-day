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
 * Expert Analysis - 2026 AI, Web Apps, and UX Best Practices
 * Analyzes codebase and provides expert recommendations
 */
export interface ExpertAnalysis {
  aiRecommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    actionable: string[]
  }[]
  webAppRecommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    actionable: string[]
  }[]
  uxRecommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    actionable: string[]
  }[]
  codebaseInsights: {
    strengths: string[]
    opportunities: string[]
    nextSteps: string[]
  }
}

export async function generateExpertAnalysis(
  codebaseContext: string,
  userQuestion?: string
): Promise<ExpertAnalysis> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const basePrompt = `You are an expert advisor on 2026 AI trends, modern web application architecture, and exceptional user experience design.

CODEBASE CONTEXT:
${codebaseContext}

TECH STACK:
- Next.js 15 (App Router, React 19, Server Components)
- Supabase (Postgres, Auth, Storage, RLS)
- TypeScript + Zod
- Tailwind CSS
- OpenAI (gpt-4o-mini)
- Resend (email)
- Stripe (payments)
- Vercel (deployment)

Provide a comprehensive expert analysis covering:

1. **2026 AI AGENDA** - Latest AI trends, best practices, and opportunities:
   - Agentic AI and autonomous workflows
   - Multimodal AI capabilities
   - AI safety and ethical considerations
   - Cost optimization strategies
   - Real-time AI features
   - Personalization at scale

2. **WEB APP BEST PRACTICES** - Modern architecture and performance:
   - Next.js 15 App Router optimization
   - Server Components vs Client Components strategy
   - Edge computing opportunities
   - Database query optimization
   - Caching strategies
   - Security hardening
   - Scalability patterns

3. **EXCEPTIONAL USER EXPERIENCE** - 2026 UX principles:
   - Micro-interactions and delight
   - Accessibility (WCAG 2.2)
   - Performance perception
   - Progressive enhancement
   - Mobile-first excellence
   - Emotional design
   - Onboarding flows
   - Error handling and recovery

4. **CODEBASE-SPECIFIC INSIGHTS**:
   - Current strengths to maintain
   - Opportunities for improvement
   - Concrete next steps

Return as JSON with this structure:
{
  "aiRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": "high|medium|low",
      "actionable": ["Action 1", "Action 2"]
    }
  ],
  "webAppRecommendations": [...],
  "uxRecommendations": [...],
  "codebaseInsights": {
    "strengths": ["Strength 1", "Strength 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "nextSteps": ["Step 1", "Step 2"]
  }
}`

  const prompt = userQuestion 
    ? `${basePrompt}\n\nUSER QUESTION: ${userQuestion}\n\nPlease focus your analysis on answering this specific question while still providing comprehensive insights.`
    : basePrompt

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a world-class expert in AI, web development, and UX design. Provide actionable, specific, and forward-thinking recommendations based on 2026 best practices.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  try {
    const content = completion.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)
    
    return {
      aiRecommendations: parsed.aiRecommendations || [],
      webAppRecommendations: parsed.webAppRecommendations || [],
      uxRecommendations: parsed.uxRecommendations || [],
      codebaseInsights: parsed.codebaseInsights || {
        strengths: [],
        opportunities: [],
        nextSteps: []
      }
    }
  } catch (error) {
    console.error('Failed to parse expert analysis:', error)
    throw new Error('Failed to generate expert analysis')
  }
}

