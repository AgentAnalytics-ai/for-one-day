# Reflection Styles System - Meta-Level Psychology Design

## 🎯 Core Principle
**Personalization without dilution** - Different approaches to Christian reflection, all rooted in Scripture, but tailored to how each person processes and engages.

## 🧠 Psychology Behind This

### Why This Works (Meta-Level UX)
1. **Cognitive Load Theory**: Too many choices = paralysis. Fewer, well-defined options = action.
2. **Personality Fit**: People process differently (analytical, emotional, practical, creative).
3. **Progressive Disclosure**: Don't ask upfront - observe behavior, then offer customization.
4. **Identity Reinforcement**: "This app gets me" feeling increases engagement.
5. **Reduced Friction**: Right style = easier to start, harder to stop.

## 📊 Reflection Styles (All Christian-Focused)

### 1. **The Scholar** 📚
**For**: Deep thinkers, Bible study enthusiasts, theological learners
- **Approach**: Longer verses, cross-references, historical context
- **Prompts**: "What does this teach us about God's character?"
- **Format**: Verse + context + deep reflection question
- **Example**: "This verse appears in 3 other places. How does that deepen your understanding?"

### 2. **The Contemplative** 🕯️
**For**: Meditative types, prayer-focused, quiet reflection seekers
- **Approach**: Shorter verses, prayer prompts, stillness focus
- **Prompts**: "What is God saying to your heart today?"
- **Format**: Verse + brief prompt + prayer space
- **Example**: "Read this slowly. What word or phrase stands out? Why?"

### 3. **The Practical** ⚡
**For**: Action-oriented, "how does this apply?" thinkers
- **Approach**: Application-focused, real-world connection
- **Prompts**: "How will you live this out today?"
- **Format**: Verse + practical application question
- **Example**: "This verse challenges us to [action]. Where will you start?"

### 4. **The Creative** 🎨
**For**: Visual learners, artists, photo/journaling enthusiasts
- **Approach**: Visual prompts, creative expression, photo-focused
- **Prompts**: "Capture something that represents this truth"
- **Format**: Verse + visual/creative prompt
- **Example**: "Take a photo of something that reminds you of God's [attribute]"

### 5. **The Quick** ⚡
**For**: Busy schedules, morning routine, brief check-ins
- **Approach**: Shorter format, essential truth, quick reflection
- **Prompts**: "One sentence: How does this apply?"
- **Format**: Key verse excerpt + one question
- **Example**: "In 2-3 sentences, how does this change your day?"

## 🚀 Implementation Strategy

### Phase 1: Auto-Detection (No Choice Overwhelm)
**First 3-7 reflections**: 
- Show standard format
- Track behavior:
  - Response length (Scholar = longer, Quick = shorter)
  - Photo usage (Creative = high)
  - Time spent (Contemplative = longer, Quick = shorter)
  - Prompt engagement (Practical = action words)

### Phase 2: Gentle Suggestion (After 7 reflections)
**Show**: "We noticed you prefer [style]. Want to try that format?"
- One-time prompt, not overwhelming
- Can dismiss or accept
- Can change later in settings

### Phase 3: Settings Override
**In Settings**: 
- "Reflection Style" dropdown
- Can manually select or keep "Auto"
- Preview of what each style looks like

## 📝 Database Schema

```sql
-- Add reflection_style to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reflection_style TEXT 
DEFAULT 'auto' 
CHECK (reflection_style IN ('auto', 'scholar', 'contemplative', 'practical', 'creative', 'quick'));

COMMENT ON COLUMN public.profiles.reflection_style IS 
'User preferred reflection style: auto (detected), scholar, contemplative, practical, creative, quick';
```

## 🎨 Prompt Variations by Style

### Same Verse, Different Approaches

**Verse**: "Be watchful, stand firm in the faith, act like men, be strong." (1 Cor 16:13)

**Scholar**:
- Full context: "Paul wrote this to the Corinthian church facing persecution..."
- Cross-reference: "See also 1 Peter 5:8-9, Ephesians 6:10-18"
- Prompt: "What does 'stand firm in the faith' mean in the original Greek? How does that deepen your understanding?"

**Contemplative**:
- Verse only
- Prompt: "Read this slowly. What does 'be watchful' mean for your heart today?"
- Prayer: "Lord, show me where I need to stand firm..."

**Practical**:
- Verse + brief context
- Prompt: "What specific situation today requires you to 'be strong'? What's your first step?"

**Creative**:
- Verse + visual
- Prompt: "Take a photo of something that represents 'standing firm' to you. What does it teach you?"

**Quick**:
- Key phrase: "Be watchful, stand firm, be strong."
- Prompt: "One sentence: Where do you need strength today?"

## 🔄 Style Detection Algorithm

```typescript
interface ReflectionMetrics {
  avgResponseLength: number
  photoUsageRate: number
  avgTimeSpent: number
  actionWordCount: number
  theologicalWordCount: number
}

function detectReflectionStyle(metrics: ReflectionMetrics): 'scholar' | 'contemplative' | 'practical' | 'creative' | 'quick' {
  // Scholar: Long responses, theological words, no photos
  if (metrics.avgResponseLength > 200 && metrics.theologicalWordCount > 3) {
    return 'scholar'
  }
  
  // Creative: High photo usage, medium responses
  if (metrics.photoUsageRate > 0.5) {
    return 'creative'
  }
  
  // Quick: Short responses, low time spent
  if (metrics.avgResponseLength < 50 && metrics.avgTimeSpent < 120) {
    return 'quick'
  }
  
  // Practical: Action words, medium responses
  if (metrics.actionWordCount > 2) {
    return 'practical'
  }
  
  // Default: Contemplative (meditative, thoughtful)
  return 'contemplative'
}
```

## 🎯 User Experience Flow

### New User (First Reflection)
1. See standard format (current)
2. No style question - just start reflecting
3. System observes behavior

### After 7 Reflections
1. Gentle notification: "We've learned your reflection style!"
2. Show preview: "You tend to write longer, deeper reflections. Try 'The Scholar' format?"
3. One-click to try, or dismiss
4. Can always change in settings

### Settings Page
1. "Reflection Style" section
2. Show current style (or "Auto-detecting...")
3. Dropdown with previews
4. "Preview" button to see example

## 💡 Why This Approach Works

1. **No Choice Paralysis**: Don't ask upfront when user doesn't know what they want
2. **Smart Defaults**: Auto-detection provides good starting point
3. **Easy Override**: Can always change, but don't have to
4. **Identity Fit**: "This app understands me" = higher retention
5. **Stays Christian**: All styles use same verses, just different approaches
6. **Progressive Enhancement**: Works great without styles, better with them

## 📊 Success Metrics

- **Engagement**: Do users with matched styles reflect more often?
- **Completion Rate**: Does the right style increase completion?
- **Response Quality**: Do users write more when style matches?
- **Retention**: Do personalized users stick around longer?

## 🚀 Implementation Priority

1. ✅ **Phase 1**: Add `reflection_style` column to profiles
2. ✅ **Phase 2**: Create prompt variation functions
3. ✅ **Phase 3**: Build style detection algorithm
4. ✅ **Phase 4**: Add settings UI for manual override
5. ✅ **Phase 5**: Add gentle suggestion after 7 reflections
6. ✅ **Phase 6**: Track metrics and refine detection

