-- Voice Recording Storage Setup
-- Create storage bucket for voice recordings

-- Create the vault storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  false, -- Private bucket
  10485760, -- 10MB limit for voice recordings
  ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];

-- Create RLS policies for the vault bucket
CREATE POLICY "Users can upload their own voice recordings" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own voice recordings" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice recordings" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add voice recording URL to vault_items metadata
-- This is already handled in the API, but we can add a comment here
-- The voice_recording_url will be stored in the metadata JSONB field
