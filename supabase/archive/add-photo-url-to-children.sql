-- Add photo_url column to child_email_accounts table
-- This allows storing child profile photos directly with their account

ALTER TABLE child_email_accounts 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN child_email_accounts.photo_url IS 'URL to child profile photo stored in Supabase Storage';

-- Create index for faster lookups (optional, but helpful)
CREATE INDEX IF NOT EXISTS idx_child_emails_photo ON child_email_accounts(photo_url) WHERE photo_url IS NOT NULL;

-- ✅ Done! Now photos can be stored directly with child profiles.

