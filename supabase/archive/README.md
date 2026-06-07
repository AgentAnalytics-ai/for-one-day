# Supabase SQL Archive

**Do not run these files on production.** They are historical one-offs, experiments, and fixes absorbed into `supabase/migrations/`.

## Active SQL (parent `supabase/` folder)

| File | Purpose |
|------|---------|
| `migrations/000_preflight_audit.sql` | Pre-migration read-only audit |
| `migrations/001_household_foundation.sql` | Household + billing foundation |
| `verify-household-foundation.sql` | Post-001 gate checks (G1–G7) |
| `schema.sql` | Reference schema |
| `policies.sql` | Reference RLS |
| `founder-referral-entitlements.sql` | Referral grants |
| `add-memory-people-and-memories.sql` | Live memories feature |
| `fix-vault-policies-no-family.sql` | Prod vault RLS (owner-based) |
| `stripe-schema-updates.sql` | Billing tables reference |
| `add-stripe-columns.sql` | Stripe profile columns |
| `add-emergency-executor-fields.sql` | Profile emergency fields |
| `storage-policies.sql` | Storage RLS |
| `media-storage-policies.sql` | Media bucket policies |
| `referral-codes.sql` | Referral codes |

## Why archived

- **fix-*** — one-off prod repairs; logic in `001` or obsolete
- **test-*** / **debug-*** / old **verify-*** — dev diagnostics only
- **family-management-schema.sql** — breaks RLS recursion if re-run
- **bulletproof-family-triggers.sql** — superseded by `001` bootstrap trigger
- Devotional / engagement era — not 2027 household product scope

Archived: Wave A Step 1 (June 2026).
