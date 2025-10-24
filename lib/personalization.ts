/**
 * 🎯 Personalization System
 * Tailors the experience for men and women while keeping it inclusive
 */

export interface UserPreferences {
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  role?: 'parent' | 'spouse' | 'adult-child' | 'executor' | 'other'
  familySituation?: 'married' | 'single-parent' | 'adult-child' | 'executor' | 'other'
}

export interface PersonalizedContent {
  greeting: string
  callToAction: string
  templates: string[]
  messaging: {
    primary: string
    secondary: string
    cta: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export function getPersonalizedContent(preferences: UserPreferences): PersonalizedContent {
  const { gender, role, familySituation } = preferences

  // Default content (inclusive)
  let content: PersonalizedContent = {
    greeting: "Welcome to your legacy journey",
    callToAction: "Start preserving your family's story",
    templates: ["Life Lessons", "Wedding Day", "Financial Wisdom", "Family Values"],
    messaging: {
      primary: "Preserve your wisdom for generations to come",
      secondary: "Your family's story deserves to be told",
      cta: "Create Your Legacy"
    },
    colors: {
      primary: "blue",
      secondary: "green", 
      accent: "purple"
    }
  }

  // Tailor for men (leadership, strength, provider themes)
  if (gender === 'male') {
    content = {
      ...content,
      greeting: "Lead your family's legacy",
      callToAction: "Build a foundation that lasts generations",
      templates: ["Leadership Lessons", "Wedding Day", "Financial Wisdom", "Family Values", "Father's Wisdom"],
      messaging: {
        primary: "Your leadership and wisdom will guide your family for generations",
        secondary: "As a man, you have the power to shape your family's future",
        cta: "Build Your Legacy"
      },
      colors: {
        primary: "blue",
        secondary: "slate",
        accent: "indigo"
      }
    }
  }

  // Tailor for women (nurturing, connection, wisdom themes)
  if (gender === 'female') {
    content = {
      ...content,
      greeting: "Nurture your family's story",
      callToAction: "Create connections that span generations",
      templates: ["Mother's Love", "Wedding Day", "Life Lessons", "Family Traditions", "Wisdom & Grace"],
      messaging: {
        primary: "Your love and wisdom will nurture your family for generations",
        secondary: "As a woman, you have the gift of creating lasting connections",
        cta: "Share Your Love"
      },
      colors: {
        primary: "rose",
        secondary: "emerald",
        accent: "violet"
      }
    }
  }

  // Role-based customization
  if (role === 'executor') {
    content = {
      ...content,
      greeting: "Honor their legacy",
      callToAction: "Help preserve their wisdom for the family",
      messaging: {
        primary: "You've been trusted with something precious",
        secondary: "Help ensure their wisdom reaches the right people",
        cta: "Honor Their Legacy"
      }
    }
  }

  if (role === 'adult-child') {
    content = {
      ...content,
      greeting: "Continue the family story",
      callToAction: "Add your chapter to the family legacy",
      messaging: {
        primary: "Your story is part of a greater family narrative",
        secondary: "Add your voice to the family's ongoing story",
        cta: "Add Your Chapter"
      }
    }
  }

  return content
}

export function getPersonalizedTemplates(preferences: UserPreferences): Array<{
  id: string
  name: string
  description: string
  category: string
  template_content: string
  placeholders: string[]
}> {
  const { gender, role } = preferences
  const baseTemplates = [
    {
      id: 'wedding-day',
      name: 'Wedding Day Letter',
      description: 'A letter for your child on their wedding day',
      category: 'milestones',
      template_content: `My Dearest [Name],

On this, your wedding day, my heart is full of joy and pride. I remember the day you were born, and now I watch as you begin this beautiful new chapter of your life.

Marriage is one of life's greatest gifts. Here's what I want you to remember:

1. Love is a choice you make every day, not just a feeling
2. Put God at the center of your marriage
3. Never stop dating your spouse
4. Learn to forgive quickly and completely
5. Laugh together often

I pray that your marriage will be a reflection of God's love for His people.

With all my love,
[Your Name]`,
      placeholders: ['Name', 'Your Name']
    },
    {
      id: 'life-lessons',
      name: 'Life Lessons',
      description: 'Share the wisdom you have gained over the years',
      category: 'wisdom',
      template_content: `Dear [Name],

As I look back on my life, there are some lessons I wish I had learned earlier. I want to share these with you so you can avoid some of the mistakes I made.

Here are the most important things I've learned:

1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

Remember, you are loved, you are capable, and you are never alone.

With love,
[Your Name]`,
      placeholders: ['Name', 'Lesson 1', 'Lesson 2', 'Lesson 3', 'Your Name']
    }
  ]

  // Add gender-specific templates
  if (gender === 'male') {
    baseTemplates.push({
      id: 'fathers-wisdom',
      name: "Father's Wisdom",
      description: 'Share your wisdom as a father and leader',
      category: 'wisdom',
      template_content: `My Dear [Name],

As your father, I want to share with you the wisdom I've gained about being a man, a leader, and a provider.

Being a man means:
- Taking responsibility for your actions
- Protecting and providing for your family
- Leading with integrity and compassion
- Being strong enough to be gentle

Remember, true strength comes from character, not just physical power.

With love and pride,
Dad`,
      placeholders: ['Name']
    })
  }

  if (gender === 'female') {
    baseTemplates.push({
      id: 'mothers-love',
      name: "Mother's Love",
      description: 'Share your love and wisdom as a mother',
      category: 'wisdom',
      template_content: `My Precious [Name],

As your mother, I want you to know how much you are loved and how proud I am of the person you've become.

Being a woman means:
- Embracing your strength and your gentleness
- Nurturing others while caring for yourself
- Leading with love and wisdom
- Creating beauty and connection wherever you go

Remember, you are enough, you are loved, and you are capable of amazing things.

With all my love,
Mom`,
      placeholders: ['Name']
    })
  }

  return baseTemplates
}

export function getPersonalizedColors(preferences: UserPreferences): {
  primary: string
  secondary: string
  accent: string
  background: string
} {
  const { gender } = preferences

  if (gender === 'male') {
    return {
      primary: 'blue-600',
      secondary: 'slate-600',
      accent: 'indigo-600',
      background: 'slate-50'
    }
  }

  if (gender === 'female') {
    return {
      primary: 'rose-600',
      secondary: 'emerald-600',
      accent: 'violet-600',
      background: 'rose-50'
    }
  }

  // Default inclusive colors
  return {
    primary: 'blue-600',
    secondary: 'green-600',
    accent: 'purple-600',
    background: 'blue-50'
  }
}
