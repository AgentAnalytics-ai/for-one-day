-- V7a — household timezone column + setter RPC
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'families'
    AND column_name = 'timezone'
) AS families_timezone_column,
EXISTS (
  SELECT 1 FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'set_family_timezone'
) AS set_family_timezone_fn;
