# 🚀 Supabase Setup - Quick Start

Run these 3 SQL files in Supabase SQL Editor **in this exact order**:

## Step 1: Add Reflection Media Column

Run this file in Supabase SQL Editor:
```
supabase/add-reflection-media.sql
```

**What it does:**
- Adds `media_urls TEXT[]` column to `daily_reflections` table
- Creates index for performance

**Copy and paste this into SQL Editor:**

```sql
-- Add media support to daily_reflections table
ALTER TABLE public.daily_reflections 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Add index for performance when querying by date
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
ON daily_reflections(user_id, date DESC);

COMMENT ON COLUMN public.daily_reflections.media_urls IS 'Array of image URLs attached to this reflection';
```

---

## Step 2: Update Vault Bucket Limits

Run this file in Supabase SQL Editor:
```
supabase/update-vault-limits.sql
```

**What it does:**
- Updates vault bucket to accept images/videos
- Increases file size limit to 50MB
- Adds image and video MIME types

**Copy and paste this into SQL Editor:**

```sql
-- Update vault bucket configuration
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB (for Pro videos)
  allowed_mime_types = ARRAY[
    'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
WHERE id = 'vault';

-- If the bucket doesn't exist yet, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  false,
  52428800,
  ARRAY[
    'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 3: Add Media Bucket Policies

Run this file in Supabase SQL Editor:
```
supabase/media-storage-policies.sql
```

**What it does:**
- Adds RLS policies for the `media` bucket
- Allows users to upload/read/delete their own reflection images

**IMPORTANT:** Make sure the `media` bucket exists first!
- Go to Storage → Create bucket → Name: `media`, Public: **OFF**

**Copy and paste this into SQL Editor:**

```sql
-- Policy: Users can upload files to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload to media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY IF NOT EXISTS "Users can read own media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## ✅ Verification Checklist

After running all 3 SQL files:

1. **Check database column:**
   - Go to Table Editor → `daily_reflections`
   - Verify `media_urls` column exists (type: text[])

2. **Check vault bucket:**
   - Go to Storage → `vault` bucket
   - Settings should show 50MB file size limit
   - Should accept images and videos

3. **Check media bucket exists:**
   - Go to Storage
   - Verify `media` bucket exists (Private)
   - If not, create it: Name `media`, Public **OFF**

4. **Check media bucket policies:**
   - Go to Storage → `media` bucket → Policies
   - Should see 3 policies (upload, read, delete)

---

## 🎯 What's Next?

Once all 3 SQL files are run successfully:
- ✅ Backend is 100% ready
- ✅ API endpoints are working
- ⏳ **UI components are next!**

---

## 📝 Quick Reference

**File Order:**
1. `supabase/add-reflection-media.sql` (Add column)
2. `supabase/update-vault-limits.sql` (Update bucket)
3. `supabase/media-storage-policies.sql` (Add policies)

**Time:** ~5 minutes total

**Success:** You should see "Success. No rows returned" or similar message after each SQL file runs.

