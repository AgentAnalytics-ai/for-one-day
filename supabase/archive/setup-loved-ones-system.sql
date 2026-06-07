-- ============================================================================
-- COMPLETE LOVED ONES SYSTEM SETUP
-- Run this ONE file to set up everything for loved ones and messages
-- This replaces the old "children" system with an inclusive "loved ones" system
-- ============================================================================

-- Step 1: Create loved_ones table (or rename if child_email_accounts exists)
DO $$
BEGIN
  -- If child_email_accounts exists, rename it
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'child_email_accounts') THEN
    ALTER TABLE child_email_accounts RENAME TO loved_ones;
    
    -- Rename columns
    ALTER TABLE loved_ones RENAME COLUMN child_name TO recipient_name;
    
    -- Update indexes
    DROP INDEX IF EXISTS idx_child_emails_user;
    DROP INDEX IF EXISTS idx_child_emails_photo;
  ELSE
    -- Create new table if it doesn't exist
    CREATE TABLE IF NOT EXISTS loved_ones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      recipient_name TEXT NOT NULL,
      email_address TEXT NOT NULL,
      password_encrypted TEXT NOT NULL,
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Ensure photo_url column exists
ALTER TABLE loved_ones ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loved_ones_user ON loved_ones(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_ones_photo ON loved_ones(photo_url) WHERE photo_url IS NOT NULL;

-- Enable RLS
ALTER TABLE loved_ones ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Users manage own child emails" ON loved_ones;
DROP POLICY IF EXISTS "Users manage own loved ones" ON loved_ones;
CREATE POLICY "Users manage own loved ones" ON loved_ones
  FOR ALL USING (user_id = auth.uid());

-- Step 2: Update unsent_messages table
DO $$
BEGIN
  -- Rename columns if they exist with old names
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'unsent_messages' AND column_name = 'child_email_account_id') THEN
    ALTER TABLE unsent_messages RENAME COLUMN child_email_account_id TO loved_one_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'unsent_messages' AND column_name = 'child_name') THEN
    ALTER TABLE unsent_messages RENAME COLUMN child_name TO recipient_name;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'unsent_messages' AND column_name = 'child_photo_url') THEN
    ALTER TABLE unsent_messages RENAME COLUMN child_photo_url TO recipient_photo_url;
  END IF;
END $$;

-- Create unsent_messages if it doesn't exist
CREATE TABLE IF NOT EXISTS unsent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loved_one_id UUID REFERENCES loved_ones(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_photo_url TEXT,
  message_content TEXT NOT NULL,
  message_title TEXT,
  scheduled_send_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Update foreign key constraint
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.table_constraints 
             WHERE constraint_name = 'unsent_messages_child_email_account_id_fkey') THEN
    ALTER TABLE unsent_messages 
    DROP CONSTRAINT unsent_messages_child_email_account_id_fkey;
  END IF;
END $$;

ALTER TABLE unsent_messages 
  DROP CONSTRAINT IF EXISTS unsent_messages_loved_one_id_fkey;

ALTER TABLE unsent_messages 
  ADD CONSTRAINT unsent_messages_loved_one_id_fkey 
  FOREIGN KEY (loved_one_id) REFERENCES loved_ones(id) ON DELETE CASCADE;

-- Indexes for unsent_messages
CREATE INDEX IF NOT EXISTS idx_unsent_messages_user ON unsent_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_unsent_messages_status ON unsent_messages(status);
CREATE INDEX IF NOT EXISTS idx_unsent_messages_scheduled ON unsent_messages(scheduled_send_date) WHERE scheduled_send_date IS NOT NULL;

-- Enable RLS
ALTER TABLE unsent_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Users manage own unsent messages" ON unsent_messages;
CREATE POLICY "Users manage own unsent messages" ON unsent_messages
  FOR ALL USING (user_id = auth.uid());

-- Step 3: Add onboarding flag to profiles (if profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ✅ Done! Everything is set up for loved ones.

