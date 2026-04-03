# ⚡ Quick Fix - Can't Save Reflection

## 🔴 Most Likely Problem

**The `daily_reflections` table doesn't exist in your Supabase database!**

---

## ✅ Quick Fix (2 Minutes)

### Step 1: Go to Supabase SQL Editor
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your project
3. Click **"SQL Editor"** in the left menu

### Step 2: Run This SQL File

**Open and copy the contents of:**
`supabase/create-daily-reflections-table.sql`

**Then paste and run it in Supabase SQL Editor**

This will:
- ✅ Create the `daily_reflections` table
- ✅ Add the `media_urls` column for images
- ✅ Set up all RLS policies
- ✅ Create indexes

---

## 🔍 Verify It Worked

After running the SQL, run this check:

```sql
-- Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'daily_reflections';

-- Verify column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_reflections';
```

**You should see:**
- `daily_reflections` table
- `media_urls` column (type: ARRAY)

---

## 🧪 Test Again

1. Go back to your app (`localhost:3000/reflection`)
2. Write a reflection
3. Click "Save Reflection"
4. **Should work now!** ✅

---

## 🐛 Still Not Working?

### Check Browser Console

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Try saving again
4. **Copy any red error messages**

### Check Network Tab

1. Press `F12` → **Network** tab
2. Try saving
3. Find `/api/reflection/daily` request
4. Click it and check:
   - **Status code** (should be 200)
   - **Response** (what does it say?)

---

## 📝 Share Error Details

If it still doesn't work, share:
1. **Console errors** (from F12)
2. **Network response** (from F12 → Network)
3. **SQL check result** (from verification query above)

This will help identify the exact issue!

---

## ✅ After It Works

Once saving works, your reflections will:
- ✅ Appear on the same `/reflection` page in a "completed" view
- ✅ Show your images in a gallery
- ✅ Appear in "This Time Last Year" card on future dates

**You're saving your legacy, one day at a time!** 📖✨

