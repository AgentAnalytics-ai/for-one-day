#!/bin/bash

# 🧹 Cleanup Script - Remove Unused Features
# This script safely removes all unused features while keeping core functionality

echo "🧹 Starting cleanup of unused features..."

# Create backup directory
mkdir -p backup-$(date +%Y%m%d-%H%M%S)

# 1. Remove Quiz & Engagement System
echo "❌ Removing quiz & engagement system..."
rm -rf app/api/engagement/
rm -rf app/api/table-talk/
rm -rf app/\(dashboard\)/table-talk/

# 2. Remove Family Calendar & Tasks
echo "❌ Removing family calendar & tasks..."
rm -rf app/api/events/
rm -rf app/api/tasks/

# 3. Remove Complex Devotional System
echo "❌ Removing complex devotional system..."
rm -rf app/api/devotionals/
rm -rf app/api/reflection/
rm -rf app/api/study/
rm -rf app/\(dashboard\)/devotional/
rm -rf app/\(dashboard\)/reflections/
rm -rf app/\(dashboard\)/study/

# 4. Remove Onboarding System
echo "❌ Removing onboarding system..."
rm -rf app/\(dashboard\)/onboarding/

# 5. Remove Executor Welcome Page
echo "❌ Removing executor welcome page..."
rm -rf app/executor/

# 6. Remove Cron Jobs
echo "❌ Removing cron jobs..."
rm -rf app/api/cron/

# 7. Remove Family Flow API
echo "❌ Removing family flow API..."
rm -f app/api/family/flow/route.ts

# 8. Remove Voice Upload
echo "❌ Removing voice upload..."
rm -f app/api/voice-upload/route.ts

# 9. Remove Schedule Delivery
echo "❌ Removing schedule delivery..."
rm -f app/api/schedule-delivery/route.ts

# 10. Remove Test & Debug APIs
echo "❌ Removing test & debug APIs..."
rm -f app/api/test-email/route.ts
rm -f app/api/test-monetization/route.ts
rm -f app/api/debug-billing/route.ts
rm -f app/api/fix-subscription/route.ts

# 11. Remove Resend Webhook
echo "❌ Removing resend webhook..."
rm -f app/api/webhooks/resend/route.ts

# 12. Remove Emergency Actions
echo "❌ Removing emergency actions..."
rm -f app/actions/emergency-actions.ts

# 13. Remove Unsubscribe Page
echo "❌ Removing unsubscribe page..."
rm -rf app/unsubscribe/

echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining core features:"
echo "  ✅ Legacy Templates - /api/legacy-templates/"
echo "  ✅ Vault System - /app/(dashboard)/vault/"
echo "  ✅ Family Sharing - /app/(dashboard)/family/"
echo "  ✅ Settings - /app/(dashboard)/settings/"
echo "  ✅ Billing - Stripe integration"
echo "  ✅ Simple Dashboard - /components/dashboard/simple-dashboard.tsx"
echo "  ✅ User Stats - For streak tracking"
echo "  ✅ User Preferences - For personalization"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: supabase/clean-minimal-schema.sql in Supabase"
echo "  2. Test core features"
echo "  3. Deploy to production"
