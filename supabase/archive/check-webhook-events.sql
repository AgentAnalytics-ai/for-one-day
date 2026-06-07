-- ============================================================================
-- CHECK WEBHOOK EVENTS
-- ============================================================================
-- Check if webhook events are being stored
-- This helps diagnose if webhooks are reaching the app
-- ============================================================================

-- Check if subscription_events table exists and has data
SELECT 
  COUNT(*) as total_events,
  event_type,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as events_last_7_days,
  MAX(created_at) as last_event
FROM subscription_events
GROUP BY event_type
ORDER BY last_event DESC;

-- Check recent webhook events for a specific user
SELECT 
  se.stripe_event_id,
  se.event_type,
  se.created_at,
  se.subscription_id,
  se.customer_id,
  (se.data->>'metadata')::jsonb->>'user_id' as user_id_from_metadata
FROM subscription_events se
WHERE se.created_at > NOW() - INTERVAL '30 days'
ORDER BY se.created_at DESC
LIMIT 50;

-- Check if webhook events table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_events'
) as table_exists;

-- ============================================================================
-- IF NO EVENTS FOUND:
-- ============================================================================
-- 1. Check Stripe Dashboard → Webhooks → Check if endpoint is configured
-- 2. Verify webhook secret in environment variables (STRIPE_WEBHOOK_SECRET)
-- 3. Check Vercel logs for webhook errors
-- 4. Test webhook endpoint manually
-- ============================================================================
