# ⚡ Quick Fix - Get Loved Ones Working

## The Problem
The form shows an error because the database table doesn't exist yet.

## The Solution (2 minutes)

### Step 1: Run SQL Migration
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy ALL of this file: `supabase/setup-loved-ones-system.sql`
3. Paste it into the SQL Editor
4. Click **Run** ✅

### Step 2: Try Again
- Go back to Settings
- Add a loved one
- **Photos are optional** - if photo fails, it still saves!

## That's It!

The feature works perfectly - we just needed to create the database table first.

## Still Not Working?

**Check the browser console (F12):**
- If you see "table does not exist" → Run the SQL migration
- If you see "bucket not found" → That's fine! Photos are optional
- If you see other errors → Share the error message

