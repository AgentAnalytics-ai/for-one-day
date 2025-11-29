# 📖 How Reflections Work - Complete Guide

## ✅ You Saved Your Reflection!

Your reflection is now saved in the database. Here's how it works:

---

## 📍 Where Your Reflections Are Stored

### Database: `daily_reflections` Table

Each reflection is stored with:
- **Your text** - Your reflection content
- **Date** - The exact date you wrote it
- **Images** - Storage paths to your uploaded photos
- **User ID** - Linked to your account

**Example:**
```
Date: January 15, 2025
Reflection: "I wanted to share this thought - test"
Images: [storage_path_1, storage_path_2]
```

---

## 🕐 "This Time Last Year" - How It Works

### The Feature

On the `/reflection` page, there's a card at the bottom called **"This Time Last Year"**.

### How It Works:

1. **Today**: You save a reflection (Jan 15, 2025)
2. **One Year Later**: On Jan 15, 2026, that reflection will appear in the "This Time Last Year" card
3. **Shows**: Your text AND images from exactly one year ago

### Example Timeline:

```
┌─────────────────────────────────────┐
│ January 15, 2025                    │
│ ✅ You write: "Had a great day..."  │
│ 📸 You add 2 photos                 │
│ 💾 Saved to database                │
└─────────────────────────────────────┘
                 ↓
          (1 year passes)
                 ↓
┌─────────────────────────────────────┐
│ January 15, 2026                    │
│ 📖 Daily verse for today            │
│ ✍️ You write new reflection         │
│                                     │
│ 🕐 THIS TIME LAST YEAR:             │
│ "Had a great day..." (from 2025)    │
│ 📸 [Photo] [Photo]                  │
└─────────────────────────────────────┘
```

---

## 📱 Where You'll See Your Reflections

### 1. **Same Day (After Saving)**
- On `/reflection` page
- Shows "Reflection completed!" with your text
- Images displayed in gallery

### 2. **Future Dates**
- **Tomorrow**: You write a new reflection
- **One Year Later**: Your reflection from today appears in "This Time Last Year" card
- **Every Year**: It keeps showing up on that date

### 3. **"This Time Last Year" Card**
- **Location**: Bottom of `/reflection` page
- **When It Shows**: Only if you have a reflection from exactly one year ago
- **What It Shows**:
  - Date from one year ago
  - Your reflection text
  - Your images (if any)

---

## 🧪 How to Test It Right Now

You don't have to wait a year! Test it now:

### Option 1: Create Test Data (Recommended)

**In Supabase SQL Editor, run:**

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create a test reflection from one year ago
INSERT INTO daily_reflections (user_id, date, reflection, media_urls)
VALUES (
  'YOUR-USER-ID-HERE',
  (CURRENT_DATE - INTERVAL '1 year')::date,
  'This was my reflection from one year ago! What a great memory to look back on.',
  ARRAY[]::text[]  -- Empty array if no images, or add storage paths
)
ON CONFLICT (user_id, date) DO NOTHING;
```

**Then:**
1. Go to `/reflection` page
2. Scroll down
3. **"This Time Last Year" card should appear!** ✨

### Option 2: Wait for Natural Timing

- Today: Save your reflection
- Tomorrow: Write another one
- In 365 days: Your first reflection will appear in the memory card

---

## 💾 Your Reflection Data

### What Gets Stored:

```json
{
  "user_id": "your-user-id",
  "date": "2025-01-15",
  "reflection": "Your text here",
  "media_urls": [
    "user-id/reflections/2025-01-15/1234567890.jpg",
    "user-id/reflections/2025-01-15/1234567891.jpg"
  ],
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Storage Locations:

1. **Text & Metadata**: `daily_reflections` table in Supabase
2. **Images**: Supabase Storage → `media` bucket
3. **Access**: Private to you (RLS policies ensure only you can see your reflections)

---

## 🔄 Daily Reflection Flow

### Today:
1. Read the daily verse
2. Write your reflection
3. Add photos (optional)
4. Save ✅

### Tomorrow:
1. New verse appears
2. Write a new reflection
3. See yesterday's reflection in "This Time Last Year" (once a year passes)

### Every Day:
- One reflection per day
- Build a library of memories
- Look back at your growth

---

## 📊 Your Reflection History

### Currently Available:

- ✅ Today's reflection (saved)
- ⏳ Tomorrow's reflection (not yet written)
- ⏳ "This Time Last Year" (appears when you have old reflections)

### Future Features (Not Yet Built):

- 📅 Calendar view of all reflections
- 🔍 Search through past reflections
- 📈 Reflection stats/streaks
- 📖 Export reflections

---

## 🎯 Summary

**Your reflection today:**
- ✅ Saved in database
- ✅ Linked to today's date (Jan 15, 2025)
- ✅ Images stored securely
- ✅ Will appear in "This Time Last Year" on Jan 15, 2026

**Where to see it:**
- **Now**: On `/reflection` page (completed view)
- **One Year From Now**: In "This Time Last Year" card on `/reflection` page
- **Every Year**: On that same date, it will keep appearing

**Test it now:**
- Create test data from one year ago (see SQL above)
- Or wait for natural timing

---

## 🚀 It's Working!

Your reflection is saved and will be part of your legacy story. Each reflection becomes a moment you can revisit and remember. The "This Time Last Year" feature helps you see how you've grown and what was important to you at different times.

**You're building something meaningful, one day at a time!** 📖✨

