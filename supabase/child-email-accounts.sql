-- Simple Child Email Accounts Table
-- For storing email credentials for future letter delivery

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
CREATE POLICY "Users manage own child emails" ON child_email_accounts
  FOR ALL USING (user_id = auth.uid());

-- Add onboarding flag to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

