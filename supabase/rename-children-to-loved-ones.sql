-- Migration: Rename child_email_accounts to loved_ones
-- This makes the feature inclusive of anyone (spouse, children, family, friends)

-- Step 1: Rename the table
ALTER TABLE IF EXISTS child_email_accounts RENAME TO loved_ones;

-- Step 2: Rename columns to be more universal
ALTER TABLE IF EXISTS loved_ones 
  RENAME COLUMN child_name TO recipient_name;

-- Step 3: Update foreign key references in unsent_messages
ALTER TABLE IF EXISTS unsent_messages 
  RENAME COLUMN child_email_account_id TO loved_one_id;

ALTER TABLE IF EXISTS unsent_messages 
  RENAME COLUMN child_name TO recipient_name;

ALTER TABLE IF EXISTS unsent_messages 
  RENAME COLUMN child_photo_url TO recipient_photo_url;

-- Step 4: Update indexes
DROP INDEX IF EXISTS idx_child_emails_user;
CREATE INDEX IF NOT EXISTS idx_loved_ones_user ON loved_ones(user_id);
DROP INDEX IF EXISTS idx_child_emails_photo;
CREATE INDEX IF NOT EXISTS idx_loved_ones_photo ON loved_ones(photo_url) WHERE photo_url IS NOT NULL;

-- Step 5: Update RLS policies
DROP POLICY IF EXISTS "Users manage own child emails" ON loved_ones;
CREATE POLICY IF NOT EXISTS "Users manage own loved ones" ON loved_ones
  FOR ALL USING (user_id = auth.uid());

-- Step 6: Update foreign key constraint in unsent_messages
ALTER TABLE IF EXISTS unsent_messages 
  DROP CONSTRAINT IF EXISTS unsent_messages_child_email_account_id_fkey;

ALTER TABLE IF EXISTS unsent_messages 
  ADD CONSTRAINT unsent_messages_loved_one_id_fkey 
  FOREIGN KEY (loved_one_id) REFERENCES loved_ones(id) ON DELETE CASCADE;

-- ✅ Done! The table is now called "loved_ones" and is inclusive of anyone.

