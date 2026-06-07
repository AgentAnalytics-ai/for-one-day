-- Complete Email System Migration
-- Run this ONE file to set up everything for child email accounts and unsent messages
-- This ensures proper order: create child_email_accounts first, then unsent_messages

-- ============================================
-- STEP 1: Child Email Accounts Table
-- ============================================
CREATE TABLE IF NOT EXISTS child_email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  password_encrypted TEXT NOT NULL, -- Encrypted password
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_child_emails_user ON child_email_accounts(user_id);

-- Enable RLS
ALTER TABLE child_email_accounts ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only see their own
DROP POLICY IF EXISTS "Users manage own child emails" ON child_email_accounts;
CREATE POLICY "Users manage own child emails" ON child_email_accounts
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEP 2: Unsent Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS unsent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_email_account_id UUID REFERENCES child_email_accounts(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_photo_url TEXT, -- URL to uploaded photo in Supabase Storage
  message_content TEXT NOT NULL,
  message_title TEXT,
  scheduled_send_date DATE, -- Optional: when to send (null = send manually)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_unsent_messages_user ON unsent_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_unsent_messages_status ON unsent_messages(status);
CREATE INDEX IF NOT EXISTS idx_unsent_messages_scheduled ON unsent_messages(scheduled_send_date) WHERE scheduled_send_date IS NOT NULL;

-- Enable RLS
ALTER TABLE unsent_messages ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own unsent messages
DROP POLICY IF EXISTS "Users manage own unsent messages" ON unsent_messages;
CREATE POLICY "Users manage own unsent messages" ON unsent_messages
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEP 3: Onboarding Flag (if profiles table exists)
-- ============================================
-- Note: Only run this if your profiles table already exists
-- If profiles doesn't exist, you'll need to create it first from your main schema.sql
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
  ELSE
    RAISE NOTICE 'profiles table does not exist. Skipping onboarding_completed column.';
  END IF;
END $$;

-- ✅ Done! Both tables are now ready.

