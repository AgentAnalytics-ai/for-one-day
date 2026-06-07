-- Update Vault Bucket Limits for Images/Videos
-- This increases file size limit and adds image/video MIME types
-- Run this in Supabase SQL Editor after creating the vault bucket

-- Update vault bucket configuration
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB (for Pro videos)
  allowed_mime_types = ARRAY[
    -- Audio (existing)
    'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg',
    -- Images (new)
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    -- Videos (new)
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
WHERE id = 'vault';

-- If the bucket doesn't exist yet, create it with proper limits
-- (This will only run if bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ✅ Done! Vault bucket now accepts images and videos up to 50MB.

