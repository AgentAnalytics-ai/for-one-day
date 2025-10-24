# 🗄️ Database Setup Guide

## Quick Setup (5 minutes)

### 1. Go to your Supabase Dashboard
- Visit [supabase.com](https://supabase.com)
- Sign in to your project
- Go to **SQL Editor**

### 2. Run the Schema
- Copy the entire contents of `supabase/schema.sql`
- Paste into the SQL Editor
- Click **Run** 

### 3. Run the Policies  
- Copy the entire contents of `supabase/policies.sql`
- Paste into the SQL Editor
- Click **Run**

### 4. Verify Setup
Check that these tables were created:
- ✅ `profiles` - User profiles
- ✅ `families` - Family groups  
- ✅ `family_members` - Family membership
- ✅ `devotion_themes` - Weekly devotional themes
- ✅ `devotion_entries` - Daily reflections
- ✅ `vault_items` - Legacy notes and letters
- ✅ `subscriptions` - Billing (for later)

## What Gets Stored

### Daily Devotional Reflections
```sql
devotion_entries (
  user_id,           -- Who wrote it
  family_id,         -- Which family
  theme_id,          -- Weekly theme
  day_index,         -- Monday=1, Saturday=6
  note,              -- The reflection text
  created_at         -- When written
)
```

### Legacy Notes ("For One Day" Letters)
```sql
vault_items (
  family_id,         -- Which family owns it
  owner_id,          -- Who created it
  kind,              -- 'letter', 'video', 'audio', etc.
  title,             -- "Letter for daughter's wedding"
  description,       -- The actual letter content
  metadata,          -- {recipient: "daughter", occasion: "wedding"}
  created_at         -- When created
)
```

## Test the Flow

1. **Sign up** → Creates profile + family
2. **Go to Devotional** → Write reflection → Save ✅
3. **Create Legacy Note** → Write letter → Save to vault ✅
4. **View Vault** → See saved letters ✅

## Example Data

After setup, you'll have one sample devotional theme:
- **"A Week of Gratitude"** with 6 daily prompts
- Scripture: 1 Thessalonians 5:18
- Perfect for testing the devotional → legacy flow

## That's It! 

Your "For One Day" devotional-to-legacy platform is ready to use! 🚀
