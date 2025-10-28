-- For One Day - Scheduled Delivery System
-- Meta Expert Implementation - 2026 Best Practices
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- PHASE 1: ADD SCHEDULING FIELDS TO EXISTING VAULT_ITEMS (NON-BREAKING)
-- ============================================================================

-- Add scheduling fields to existing vault_items table
ALTER TABLE vault_items 
ADD COLUMN IF NOT EXISTS scheduled_delivery_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_delivery_time TIME,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'draft' CHECK (delivery_status IN ('draft', 'scheduled', 'sent', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS recipient_email TEXT,
ADD COLUMN IF NOT EXISTS recipient_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_message TEXT; -- Optional personal message

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_items_scheduled ON vault_items(scheduled_delivery_date, delivery_status);
CREATE INDEX IF NOT EXISTS idx_vault_items_recipient ON vault_items(recipient_email);

-- ============================================================================
-- PHASE 2: DELIVERY QUEUE SYSTEM
-- ============================================================================

-- Delivery queue for cron job processing
CREATE TABLE IF NOT EXISTS delivery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cron job efficiency
CREATE INDEX IF NOT EXISTS idx_delivery_queue_scheduled ON delivery_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_delivery_queue_status ON delivery_queue(status, created_at);

-- ============================================================================
-- PHASE 3: RECIPIENT MANAGEMENT
-- ============================================================================

-- Recipients table for managing email addresses
CREATE TABLE IF NOT EXISTS delivery_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  relationship TEXT CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'friend', 'executor', 'other')),
  is_primary BOOLEAN DEFAULT FALSE, -- Primary recipient for emergency access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Index for user's recipients
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_user ON delivery_recipients(user_id);

-- ============================================================================
-- PHASE 4: DELIVERY ANALYTICS
-- ============================================================================

-- Track delivery performance and user engagement
CREATE TABLE IF NOT EXISTS delivery_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_delivery_analytics_vault ON delivery_analytics(vault_item_id);
CREATE INDEX IF NOT EXISTS idx_delivery_analytics_status ON delivery_analytics(delivery_status, created_at);

-- ============================================================================
-- PHASE 5: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE delivery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_analytics ENABLE ROW LEVEL SECURITY;

-- Delivery queue policies (only system can access)
CREATE POLICY "System can manage delivery queue" ON delivery_queue
  FOR ALL USING (true); -- System access only

-- Recipients policies (users can manage their own)
CREATE POLICY "Users can view own recipients" ON delivery_recipients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recipients" ON delivery_recipients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recipients" ON delivery_recipients
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recipients" ON delivery_recipients
  FOR DELETE USING (user_id = auth.uid());

-- Analytics policies (users can view their own)
CREATE POLICY "Users can view own analytics" ON delivery_analytics
  FOR SELECT USING (
    vault_item_id IN (
      SELECT id FROM vault_items WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- PHASE 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to create delivery queue entry
CREATE OR REPLACE FUNCTION create_delivery_queue_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create queue entry if item is scheduled for delivery
  IF NEW.delivery_status = 'scheduled' AND NEW.scheduled_delivery_date IS NOT NULL THEN
    INSERT INTO delivery_queue (
      vault_item_id,
      scheduled_for,
      status
    ) VALUES (
      NEW.id,
      (NEW.scheduled_delivery_date + NEW.scheduled_delivery_time)::TIMESTAMPTZ,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create delivery queue entries
CREATE TRIGGER create_delivery_queue_trigger
  AFTER INSERT OR UPDATE ON vault_items
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_queue_entry();

-- Function to get scheduled deliveries for cron job
CREATE OR REPLACE FUNCTION get_pending_deliveries()
RETURNS TABLE (
  queue_id UUID,
  vault_item_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  title TEXT,
  content TEXT,
  kind TEXT,
  delivery_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dq.id as queue_id,
    dq.vault_item_id,
    vi.recipient_email,
    vi.recipient_name,
    vi.title,
    vi.description as content,
    vi.kind,
    vi.delivery_message
  FROM delivery_queue dq
  JOIN vault_items vi ON dq.vault_item_id = vi.id
  WHERE dq.status = 'pending'
    AND dq.scheduled_for <= NOW()
  ORDER BY dq.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 7: SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert sample recipient for testing
-- INSERT INTO delivery_recipients (user_id, email, name, relationship, is_primary)
-- VALUES (
--   (SELECT user_id FROM profiles LIMIT 1),
--   'test@example.com',
--   'Test Recipient',
--   'spouse',
--   true
-- );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Scheduled Delivery System Successfully Implemented!' as status,
       'Ready for Meta Expert UI Implementation' as next_step;