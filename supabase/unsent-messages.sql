-- Unsent Messages Table
-- For storing messages to children before they're sent via email

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
CREATE POLICY "Users manage own unsent messages" ON unsent_messages
  FOR ALL USING (user_id = auth.uid());

