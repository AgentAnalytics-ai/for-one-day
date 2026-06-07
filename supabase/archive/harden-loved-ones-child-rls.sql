-- Optional hardening: explicit WITH CHECK so updated/inserted rows must still belong to auth.uid().
-- Safe to run if you already have "Users manage own ..." policies (they are replaced).
-- Apply the blocks that match tables that exist in your project (loved_ones vs child_email_accounts).

-- loved_ones (inclusive naming migration)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loved_ones') THEN
    DROP POLICY IF EXISTS "Users manage own loved ones" ON public.loved_ones;
    CREATE POLICY "Users manage own loved ones" ON public.loved_ones
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- child_email_accounts (legacy table name; skip if you only use loved_ones)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'child_email_accounts') THEN
    DROP POLICY IF EXISTS "Users manage own child emails" ON public.child_email_accounts;
    CREATE POLICY "Users manage own child emails" ON public.child_email_accounts
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- unsent_messages: same pattern (users must not reassign rows to another user)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'unsent_messages') THEN
    DROP POLICY IF EXISTS "Users manage own unsent messages" ON public.unsent_messages;
    CREATE POLICY "Users manage own unsent messages" ON public.unsent_messages
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
