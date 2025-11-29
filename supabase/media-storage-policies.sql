-- Storage Bucket Policies for Media (Reflection Images)
-- Run this AFTER creating the 'media' bucket in Supabase Storage dashboard
-- This allows authenticated users to upload and read their own files

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media files" ON storage.objects;

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload to media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ✅ Done! Users can now upload, read, and delete files in the media bucket.

