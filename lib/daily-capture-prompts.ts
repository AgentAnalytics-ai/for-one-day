/**
 * Optional secular prompts for the memory capture card (not scripture).
 */

const PROMPTS: string[] = [
  'A small moment from today you want them to remember',
  'Something they did that made you proud',
  'A wish you have for their week ahead',
  'A funny or sweet detail you do not want to forget',
  'What you would tell them if you had thirty seconds',
  'A tradition or inside joke that matters to you both',
]

export function getDailyCapturePrompt(): string {
  const start = new Date(Date.UTC(new Date().getFullYear(), 0, 0))
  const day = Math.floor((Date.now() - start.getTime()) / 86400000)
  return PROMPTS[day % PROMPTS.length]
}
