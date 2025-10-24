-- Add scheduled delivery functionality to vault_items
-- Run this in your Supabase SQL Editor

-- Add scheduled delivery columns to vault_items table
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS scheduled_delivery_date timestamptz,
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'cancelled'));

-- Create delivery_recipients table
CREATE TABLE IF NOT EXISTS public.delivery_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id uuid NOT NULL REFERENCES public.vault_items(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
  resend_email_id text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_vault_item ON delivery_recipients(vault_item_id);
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_status ON delivery_recipients(delivery_status);
CREATE INDEX IF NOT EXISTS idx_vault_items_scheduled_delivery ON vault_items(scheduled_delivery_date) WHERE scheduled_delivery_date IS NOT NULL;

-- Add RLS policies for delivery_recipients
ALTER TABLE public.delivery_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see delivery recipients for their own vault items
CREATE POLICY "Users can view delivery recipients for their vault items" ON public.delivery_recipients
  FOR SELECT USING (
    vault_item_id IN (
      SELECT id FROM public.vault_items WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert delivery recipients for their own vault items
CREATE POLICY "Users can insert delivery recipients for their vault items" ON public.delivery_recipients
  FOR INSERT WITH CHECK (
    vault_item_id IN (
      SELECT id FROM public.vault_items WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update delivery recipients for their own vault items
CREATE POLICY "Users can update delivery recipients for their vault items" ON public.delivery_recipients
  FOR UPDATE USING (
    vault_item_id IN (
      SELECT id FROM public.vault_items WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can delete delivery recipients for their own vault items
CREATE POLICY "Users can delete delivery recipients for their vault items" ON public.delivery_recipients
  FOR DELETE USING (
    vault_item_id IN (
      SELECT id FROM public.vault_items WHERE owner_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.delivery_recipients IS 'Recipients for scheduled delivery of legacy notes';
COMMENT ON COLUMN public.vault_items.scheduled_delivery_date IS 'When this legacy note should be delivered';
COMMENT ON COLUMN public.vault_items.delivery_status IS 'Status of the scheduled delivery';
