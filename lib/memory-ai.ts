import { openai } from '@/lib/ai'

export type MemoryPolishMode = 'grammar' | 'expand'

/**
 * Polish memory note text: fix grammar (all users) or expand into a fuller note (Pro).
 */
export async function polishMemoryText(params: {
  text: string
  mode: MemoryPolishMode
  personName?: string
}): Promise<string | null> {
  if (!openai || !params.text.trim()) {
    return null
  }

  const name = params.personName?.trim() || 'this person'

  const system =
    params.mode === 'grammar'
      ? `You are a careful editor. Fix spelling, grammar, and punctuation only. Keep the author's voice, tone, and meaning. Do not add new ideas or flattery. Output plain text only, no quotes around the whole message.`
      : `You are a warm, concise writing assistant. The user is saving a private memory for someone they love (${name}). Expand their short note into a fuller 2–4 sentence message that still sounds human and personal—not generic or preachy. Use "you" when addressing the loved one if natural. No subject headers. Plain text only.`

  const user =
    params.mode === 'grammar'
      ? `Edit this note:\n\n${params.text.trim()}`
      : `Their rough note (keep the heart of it):\n\n${params.text.trim()}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: params.mode === 'grammar' ? 0.2 : 0.65,
      max_tokens: params.mode === 'grammar' ? 500 : 600,
    })
    const out = completion.choices[0]?.message?.content?.trim()
    return out || null
  } catch (e) {
    console.error('polishMemoryText:', e)
    return null
  }
}
