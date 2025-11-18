-- Storage Bucket Policies for Vault
-- Run this AFTER creating the 'vault' bucket in Supabase Storage dashboard
-- This allows authenticated users to upload and read their own files

-- Policy: Users can upload files to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload to vault"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY IF NOT EXISTS "Users can read own vault files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own vault files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ✅ Done! Users can now upload, read, and delete files in the vault bucket.

