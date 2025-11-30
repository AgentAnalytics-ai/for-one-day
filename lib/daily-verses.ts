/**
 * Curated daily Bible verses for reflection
 * Simple rotation - no database needed
 */

export interface DailyVerse {
  reference: string
  text: string
  prompt: string
  theme: string
}

export const DAILY_VERSES: DailyVerse[] = [
  {
    reference: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
    prompt: "Where do you need to lead courageously today instead of fearfully?",
    theme: "courage"
  },
  {
    reference: "Proverbs 22:6",
    text: "Train up a child in the way he should go; even when he is old he will not depart from it.",
    prompt: "What specific truth or skill are you intentionally teaching others this week?",
    theme: "teaching"
  },
  {
    reference: "Ephesians 6:4",
    text: "Fathers, do not provoke your children to anger, but bring them up in the discipline and instruction of the Lord.",
    prompt: "How are you balancing correction with encouragement in your relationships?",
    theme: "discipline"
  },
  {
    reference: "Psalm 127:3-4",
    text: "Behold, children are a heritage from the Lord, the fruit of the womb a reward. Like arrows in the hand of a warrior are the children of one's youth.",
    prompt: "How are you preparing those you influence for their future?",
    theme: "legacy"
  },
  {
    reference: "1 Corinthians 16:13",
    text: "Be watchful, stand firm in the faith, act like men, be strong.",
    prompt: "What challenge or obstacle do you need to be more watchful against today?",
    theme: "strength"
  },
  {
    reference: "Deuteronomy 6:6-7",
    text: "And these words that I command you today shall be on your heart. You shall teach them diligently to your children, and shall talk of them when you sit in your house, and when you walk by the way, and when you lie down, and when you rise.",
    prompt: "What everyday moment today can you use to share wisdom with others?",
    theme: "teaching"
  },
  {
    reference: "Proverbs 20:7",
    text: "The righteous who walks in his integrity—blessed are his children after him!",
    prompt: "Where are you tempted to compromise integrity? What will that cost those you influence?",
    theme: "integrity"
  },
  {
    reference: "1 Timothy 5:8",
    text: "But if anyone does not provide for his relatives, and especially for members of his household, he has denied the faith and is worse than an unbeliever.",
    prompt: "Beyond finances, what non-material provision do your loved ones need from you?",
    theme: "provision"
  },
  {
    reference: "Psalm 78:4",
    text: "We will not hide them from their children, but tell to the coming generation the glorious deeds of the Lord, and his might, and the wonders that he has done.",
    prompt: "What story of God's faithfulness in your life have you not shared yet?",
    theme: "testimony"
  },
  {
    reference: "James 1:19",
    text: "Know this, my beloved brothers: let every person be quick to hear, slow to speak, slow to anger",
    prompt: "When did you rush to speak instead of listening today? What did you miss?",
    theme: "listening"
  },
  {
    reference: "Proverbs 3:11-12",
    text: "My son, do not despise the Lord's discipline or be weary of his reproof, for the Lord reproves him whom he loves, as a father the son in whom he delights.",
    prompt: "How do you show others that correction comes from love?",
    theme: "love"
  },
  {
    reference: "Colossians 3:21",
    text: "Fathers, do not provoke your children, lest they become discouraged.",
    prompt: "Have you discouraged others with unrealistic expectations or harsh words?",
    theme: "encouragement"
  },
  {
    reference: "Psalm 103:13",
    text: "As a father shows compassion to his children, so the Lord shows compassion to those who fear him.",
    prompt: "Where do others need your compassion instead of correction today?",
    theme: "compassion"
  },
  {
    reference: "Proverbs 13:24",
    text: "Whoever spares the rod hates his son, but he who loves him is diligent to discipline him.",
    prompt: "What behavior have you been avoiding addressing? Why?",
    theme: "discipline"
  },
  {
    reference: "Matthew 7:11",
    text: "If you then, who are evil, know how to give good gifts to your children, how much more will your Father who is in heaven give good things to those who ask him!",
    prompt: "What good gift can you give others today that points them to God?",
    theme: "generosity"
  },
  {
    reference: "2 Timothy 1:5",
    text: "I am reminded of your sincere faith, a faith that dwelt first in your grandmother Lois and your mother Eunice and now, I am sure, dwells in you as well.",
    prompt: "What spiritual legacy are you intentionally leaving for future generations?",
    theme: "legacy"
  },
  {
    reference: "Proverbs 17:6",
    text: "Grandchildren are the crown of the aged, and the glory of children is their fathers.",
    prompt: "Would those you influence be proud to describe you to others? Why or why not?",
    theme: "honor"
  },
  {
    reference: "1 Peter 3:7",
    text: "Likewise, husbands, live with your wives in an understanding way, showing honor to the woman as the weaker vessel, since they are heirs with you of the grace of life, so that your prayers may not be hindered.",
    prompt: "How are you honoring your spouse or partner as a co-heir of grace today?",
    theme: "marriage"
  },
  {
    reference: "Malachi 4:6",
    text: "And he will turn the hearts of fathers to their children and the hearts of children to their fathers, lest I come and strike the land with a decree of utter destruction.",
    prompt: "What barrier exists between you and those you love? What would it take to remove it?",
    theme: "relationship"
  },
  {
    reference: "Proverbs 1:8-9",
    text: "Hear, my son, your father's instruction, and forsake not your mother's teaching, for they are a graceful garland for your head and pendants for your neck.",
    prompt: "What instruction are you consistently giving others that will guide them for life?",
    theme: "wisdom"
  },
  {
    reference: "Psalm 127:1",
    text: "Unless the Lord builds the house, those who build it labor in vain. Unless the Lord watches over the city, the watchman stays awake in vain.",
    prompt: "Are you trying to build your life in your own strength, or with God's help?",
    theme: "dependence"
  },
  {
    reference: "Proverbs 4:23",
    text: "Keep your heart with all vigilance, for from it flow the springs of life.",
    prompt: "What are you allowing into your heart that could poison your relationships?",
    theme: "purity"
  },
  {
    reference: "1 Thessalonians 2:11-12",
    text: "For you know how, like a father with his children, we exhorted each one of you and encouraged you and charged you to walk in a manner worthy of God.",
    prompt: "Which do those around you need most from you right now: exhortation, encouragement, or charging?",
    theme: "leadership"
  },
  {
    reference: "Hebrews 12:7",
    text: "It is for discipline that you have to endure. God is treating you as sons. For what son is there whom his father does not discipline?",
    prompt: "How are you accepting God's discipline in your own life as an example to others?",
    theme: "discipline"
  },
  {
    reference: "Proverbs 10:1",
    text: "A wise son makes a glad father, but a foolish son is a sorrow to his mother.",
    prompt: "How are you training wisdom into those you influence today?",
    theme: "wisdom"
  },
  {
    reference: "1 John 3:18",
    text: "Little children, let us not love in word or talk but in deed and in truth.",
    prompt: "How did you show love through actions today, not just words?",
    theme: "action"
  },
  {
    reference: "Philippians 4:8-9",
    text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.",
    prompt: "What are you meditating on that is shaping how you lead and influence others?",
    theme: "mindset"
  },
  {
    reference: "Proverbs 14:26",
    text: "In the fear of the Lord one has strong confidence, and his children will have a refuge.",
    prompt: "Are you creating a refuge for others through your faith in God?",
    theme: "refuge"
  },
  {
    reference: "Isaiah 54:13",
    text: "All your children shall be taught by the Lord, and great shall be the peace of your children.",
    prompt: "How are you partnering with God to teach and guide others?",
    theme: "peace"
  },
  {
    reference: "Luke 15:20",
    text: "And he arose and came to his father. But while he was still a long way off, his father saw him and felt compassion, and ran and embraced him and kissed him.",
    prompt: "Are you watching for others' return when they wander, ready to embrace them?",
    theme: "forgiveness"
  }
]

/**
 * Get verse for today based on day of year
 * Ensures rotation without repeating
 */
export function getTodaysVerse(): DailyVerse {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  
  // Rotate through verses based on day of year
  const index = dayOfYear % DAILY_VERSES.length
  return DAILY_VERSES[index]
}

