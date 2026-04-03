# ✅ Verify Supabase Setup

Run the verification script to check if everything is set up correctly.

## Quick Verification

Run this file in Supabase SQL Editor:
```
supabase/verify-media-setup.sql
```

## Manual Checks

### 1. Check Database Column

**In Supabase Dashboard:**
- Go to **Table Editor** → `daily_reflections`
- Look for `media_urls` column (type: `text[]`)

**Or run SQL:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_reflections' 
    AND column_name = 'media_urls';
```
**Expected:** Should show `media_urls` with type `ARRAY`

---

### 2. Check Vault Bucket

**In Supabase Dashboard:**
- Go to **Storage** → `vault` bucket → **Settings**
- Check **File size limit**: Should be **50 MB**
- Check **Allowed MIME types**: Should include `image/*` and `video/*`

**Or run SQL:**
```sql
SELECT file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'vault';
```
**Expected:** `file_size_limit = 52428800`, MIME types include images/videos

---

### 3. Check Media Bucket Exists

**In Supabase Dashboard:**
- Go to **Storage**
- Look for `media` bucket (should exist, Private)

**Or run SQL:**
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'media';
```
**Expected:** Should return the media bucket, `public = false`

---

### 4. Check Media Bucket Policies

**In Supabase Dashboard:**
- Go to **Storage** → `media` bucket → **Policies**
- Should see 3 policies:
  1. "Users can upload to media" (INSERT)
  2. "Users can read own media files" (SELECT)
  3. "Users can delete own media files" (DELETE)

**Or run SQL:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%media%';
```
**Expected:** Should return 3 rows

---

## ✅ All Checks Pass?

If all checks pass, you're ready for UI implementation! 🎉

If any checks fail, let me know which one and I'll help fix it.

