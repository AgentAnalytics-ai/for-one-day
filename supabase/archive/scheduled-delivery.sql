-- Scheduled Delivery System
-- Allows users to schedule legacy notes for future delivery

-- Add scheduled delivery fields to vault_items
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS scheduled_delivery_date timestamptz,
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'cancelled'));

-- Create delivery_logs table to track delivery attempts
CREATE TABLE IF NOT EXISTS public.delivery_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_item_id uuid REFERENCES public.vault_items(id) ON DELETE CASCADE,
  delivery_attempted_at timestamptz DEFAULT now(),
  delivery_status text NOT NULL CHECK (delivery_status IN ('sent', 'failed')),
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'notification')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create delivery_recipients table for email delivery
CREATE TABLE IF NOT EXISTS public.delivery_recipients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_item_id uuid REFERENCES public.vault_items(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  relationship text, -- 'wife', 'son', 'daughter', etc.
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies for delivery_logs
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery logs" ON public.delivery_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vault_items 
      WHERE vault_items.id = delivery_logs.vault_item_id 
      AND vault_items.owner_id = auth.uid()
    )
  );

-- RLS Policies for delivery_recipients
ALTER TABLE public.delivery_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own delivery recipients" ON public.delivery_recipients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vault_items 
      WHERE vault_items.id = delivery_recipients.vault_item_id 
      AND vault_items.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vault_items_delivery_date ON public.vault_items(scheduled_delivery_date) WHERE scheduled_delivery_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vault_items_delivery_status ON public.vault_items(delivery_status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_vault_item ON public.delivery_logs(vault_item_id);
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_vault_item ON public.delivery_recipients(vault_item_id);

-- Function to get items ready for delivery
CREATE OR REPLACE FUNCTION get_items_ready_for_delivery()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  owner_id uuid,
  scheduled_delivery_date timestamptz,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vi.id,
    vi.title,
    vi.description,
    vi.owner_id,
    vi.scheduled_delivery_date,
    vi.metadata
  FROM public.vault_items vi
  WHERE vi.scheduled_delivery_date IS NOT NULL
    AND vi.delivery_status = 'pending'
    AND vi.scheduled_delivery_date <= now()
    AND vi.kind = 'letter';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
