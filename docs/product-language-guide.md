# Product Language Guide — 2027

## Purpose

Source of truth for user-facing language in For One Day.  
Aligns naming psychology, SEO, and UI copy with the kitchen-tablet + phone model.

**Core rule:** lead with *daily plan at home*; memories and keepsakes are the credible plus on phone.

## One-Line Positioning

For One Day helps your family **know what matters today** — and **keep what matters for one day.**

## Narrative Pillars

1. **Today at home** — schedule, dinner, lists, our focus (glanceable on tablet).
2. **One household** — spouse inherits Pro; calm “At home” chrome.
3. **Phone depth** — save a memory, write a keepsake (inside More, not wall tabs).
4. **Pro** — run the full week for the whole home.

## Psychology Layers (apply one per surface)

| Layer | Where | Rule |
|-------|-------|------|
| 1 Trust & glance | Kitchen wall, Today | 3-second answer; no forms on wall |
| 2 Naming & framing | Marketing, all copy | Lexicon + Sara sentence test |
| 3 Calm premium | Visual system | Serif emotion, sans schedule, warm canvas |
| 4 Meta engagement | Phone memories only | Feedback loops — never on wall |

## Five Gates (10/10 scorecard)

Every surface must pass before ship:

1. **Context** — Wall, phone, or marketing?
2. **Glance** — Answered in 3 seconds?
3. **Sara** — Can Sara say this out loud?
4. **Lexicon** — No “never say” words?
5. **Layer** — Only the right psychology layer on this screen?

**Sara sentence test:**  
*On the kitchen wall I see dinner and soccer — that's Today. On my phone I open More to save a memory or write a keepsake.*

## Approved Vocabulary

### Brand
- For One Day
- Know what matters today
- Your family's daily plan
- Home Install (not setup fee)

### Wall / daily ops
- Today · This week · Lists
- Dinner tonight · Schedule · Our focus
- Add to today · + Add

### Phone / reflective
- More (menu)
- Save a memory · Write a keepsake
- Memories for today · Keepsakes for one day
- People you love

### Household
- At home · Your household · Family (settings label when renamed)

### Pro
- Run the full week
- One plan for your home ($9.99/mo per household)

### Invisible help (AI backend, human front)
Best help feels like a calm friend — not a product line. **No sub-brand names** (no ForDinner, ForPlanning, etc.). OpenAI stays internal.

**Dinner arc (recognition → partnership → completion):**

| Stage | Psychology | Copy pattern | Example |
|-------|------------|--------------|---------|
| Glance | Mirror their thought | Soft question | “What’s for dinner?” |
| Entry | Invite, don’t sell | “Need a hand…?” | “Need a hand with dinner?” |
| Commit | First-person agency | Verb they’d say | “Walk me through it” |
| In progress | Thinking *with* them | No “AI” or “planning” | “Figuring out the order…” |
| Result | Competence + household | Outcome, not feature | “Set for tonight — everyone sees it on Today” |

| Moment | User sees | Status | Connects to |
|--------|-----------|--------|-------------|
| Dinner walk-through | “Need a hand with dinner?” → “Walk me through it” | Ship (6D) | Today · This week · Lists |
| Saved recipes | “Save this recipe” (future) | 6E–6F | meal_ideas · Shopping |
| Week nudge | “You’ve got a lot Thursday” (future) | Later | This week · schedule |

**Say:** “Need a hand with dinner?” · “Right now” · “Still need from the store.”  
**Never say:** AI · assistant · chatbot · GPT · branded *ForX* names (user-facing).  
**Sara test:** *I’m frazzled at 5 — I tap need a hand, it tells me what to do first. I didn’t think about AI.*

Reference: `docs/internal/for-ai-brand-map.html` (invisible-help principles)

## Never Say (user-facing)

- Vault · Legacy · Inbox · Hub · OS · Dashboard
- Family OS · Smart dashboard · Command center
- Skylight alternative
- AI family assistant · AI assistant (lead)
- Family connections (as product label)
- Begin your legacy · Preserve wisdom forever

Internal route/table names may still use legacy identifiers until a dedicated migration.

## CTA Standards

| Context | Primary | Secondary |
|---------|---------|-----------|
| Marketing | Start with Today | Sign in |
| Daily ops | + Add to today | — |
| Pro | Run the full week | See what's included |
| Memories | Save a memory | View memories |

Avoid: *Upgrade to Pro*, *Start Free Today* (prefer verb-first warm CTAs).

## Plan and Monetization Language

- **Free:** Start your home's daily plan; core capture on phone.
- **Pro:** Run the full week — unlimited keepsakes, shared household, meal walk-through and writing help on phone.
- **Household:** One $9.99/mo; members inherit Pro.
- **Help gating:** "Included with Pro for your home" — never lead with AI.

## SEO Keywords (primary)

- family daily planner
- kitchen family calendar
- household schedule app
- family to-do list
- dinner planner family

Secondary (moat): memory journal, keepsakes, family memories.

## GTM Event Naming

Use snake_case. Prefer: `daily_plan_viewed`, `household_invite_sent`, `memory_saved`, `upgrade_viewed`, `upgrade_checkout_started`.

## PR Checklist

- [ ] Five gates passed
- [ ] Metadata, landing, upgrade use same one-liner
- [ ] No deprecated vocabulary in user-facing text
- [ ] Wall/marketing never lead with memory-only framing
- [ ] Pro copy mentions household where relevant
