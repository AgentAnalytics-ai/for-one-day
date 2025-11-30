/**
 * Reflection Styles System
 * Personalizes the reflection experience while staying Christian-focused
 * Different approaches to the same verses based on user preferences
 */

export type ReflectionStyle = 
  | 'auto'           // Auto-detect from behavior
  | 'scholar'        // Deep theological study
  | 'contemplative'  // Meditative, prayer-focused
  | 'practical'      // Action-oriented, real-world application
  | 'creative'       // Visual, artistic, photo-focused
  | 'quick'          // Brief daily check-in

export interface ReflectionMetrics {
  avgResponseLength: number
  photoUsageRate: number      // 0-1, percentage of reflections with photos
  avgTimeSpent: number        // seconds
  actionWordCount: number     // words like "do", "act", "apply", "change"
  theologicalWordCount: number // words like "faith", "God", "scripture", "prayer"
}

export interface StylePrompt {
  verse: string
  context?: string
  crossReferences?: string[]
  prompt: string
  prayerPrompt?: string
  visualPrompt?: string
  quickPrompt?: string
}

/**
 * Detect reflection style from user behavior
 * Analyzes past reflections to determine preferred style
 */
export function detectReflectionStyle(metrics: ReflectionMetrics): Exclude<ReflectionStyle, 'auto'> {
  // Scholar: Long responses, theological depth, minimal photos
  if (metrics.avgResponseLength > 200 && metrics.theologicalWordCount > 3 && metrics.photoUsageRate < 0.2) {
    return 'scholar'
  }
  
  // Creative: High photo usage, visual engagement
  if (metrics.photoUsageRate > 0.5) {
    return 'creative'
  }
  
  // Quick: Short responses, low time spent
  if (metrics.avgResponseLength < 50 && metrics.avgTimeSpent < 120) {
    return 'quick'
  }
  
  // Practical: Action-oriented language, medium responses
  if (metrics.actionWordCount > 2 && metrics.avgResponseLength > 80 && metrics.avgResponseLength < 200) {
    return 'practical'
  }
  
  // Default: Contemplative (meditative, thoughtful, prayer-focused)
  return 'contemplative'
}

/**
 * Get style-specific prompt for a verse
 * All styles use the same verse, but approach it differently
 */
export function getStylePrompt(
  verse: {
    reference: string
    text: string
    prompt: string
    theme: string
  },
  style: ReflectionStyle
): string {
  // If auto, use default prompt (will be personalized later)
  if (style === 'auto') {
    return verse.prompt
  }

  const basePrompt = verse.prompt
  const theme = verse.theme.toLowerCase()

  switch (style) {
    case 'scholar':
      return `What does this passage teach us about God's character and our response? Consider the historical context and how this truth applies across Scripture.`
    
    case 'contemplative':
      return `Read this verse slowly. What word or phrase stands out to you? What is God saying to your heart today?`
    
    case 'practical':
      return `How will you live this out today? What specific action or change does this verse call you to make?`
    
    case 'creative':
      return `Capture something that represents this truth. Take a photo of what this verse means to you, or draw/write your thoughts around it.`
    
    case 'quick':
      return `In 2-3 sentences, how does this apply to your day?`
    
    default:
      return basePrompt
  }
}

/**
 * Get style-specific context/guidance
 */
export function getStyleContext(
  verse: {
    reference: string
    text: string
    theme: string
  },
  style: ReflectionStyle
): string | null {
  if (style === 'auto' || style === 'quick') {
    return null
  }

  switch (style) {
    case 'scholar':
      return `This verse appears in the context of [book context]. Consider how this theme connects to other passages in Scripture.`
    
    case 'contemplative':
      return `Take a moment of stillness. Let this truth settle in your heart before you respond.`
    
    case 'practical':
      return `This verse calls us to action. What does it look like in your daily life?`
    
    case 'creative':
      return `Express this truth visually. What image, drawing, or photo captures what this verse means to you?`
    
    default:
      return null
  }
}

/**
 * Get style description for settings/preview
 */
export function getStyleDescription(style: Exclude<ReflectionStyle, 'auto'>): {
  name: string
  description: string
  icon: string
  example: string
} {
  const styles = {
    scholar: {
      name: 'The Scholar',
      description: 'Deep theological study with context and cross-references',
      icon: '📚',
      example: 'What does this teach us about God\'s character?'
    },
    contemplative: {
      name: 'The Contemplative',
      description: 'Meditative reflection with prayer focus',
      icon: '🕯️',
      example: 'What is God saying to your heart today?'
    },
    practical: {
      name: 'The Practical',
      description: 'Action-oriented application to daily life',
      icon: '⚡',
      example: 'How will you live this out today?'
    },
    creative: {
      name: 'The Creative',
      description: 'Visual expression through photos and creative journaling',
      icon: '🎨',
      example: 'Capture something that represents this truth'
    },
    quick: {
      name: 'The Quick',
      description: 'Brief daily check-in for busy schedules',
      icon: '⚡',
      example: 'In 2-3 sentences, how does this apply?'
    }
  }

  return styles[style]
}

/**
 * Get all available styles (for settings dropdown)
 */
export function getAllStyles(): Array<{
  value: Exclude<ReflectionStyle, 'auto'>
  name: string
  description: string
  icon: string
}> {
  const styleValues: Exclude<ReflectionStyle, 'auto'>[] = ['scholar', 'contemplative', 'practical', 'creative', 'quick']
  
  return styleValues.map(value => {
    const style = getStyleDescription(value)
    return {
      value,
      name: style.name,
      description: style.description,
      icon: style.icon
    }
  })
}

