@echo off
REM 🧹 Cleanup Script - Remove Unused Features
REM This script safely removes all unused features while keeping core functionality

echo 🧹 Starting cleanup of unused features...

REM 1. Remove Quiz & Engagement System
echo ❌ Removing quiz & engagement system...
rmdir /s /q "app\api\engagement" 2>nul
rmdir /s /q "app\api\table-talk" 2>nul
rmdir /s /q "app\(dashboard)\table-talk" 2>nul

REM 2. Remove Family Calendar & Tasks
echo ❌ Removing family calendar & tasks...
rmdir /s /q "app\api\events" 2>nul
rmdir /s /q "app\api\tasks" 2>nul

REM 3. Remove Complex Devotional System
echo ❌ Removing complex devotional system...
rmdir /s /q "app\api\devotionals" 2>nul
rmdir /s /q "app\api\reflection" 2>nul
rmdir /s /q "app\api\study" 2>nul
rmdir /s /q "app\(dashboard)\devotional" 2>nul
rmdir /s /q "app\(dashboard)\reflections" 2>nul
rmdir /s /q "app\(dashboard)\study" 2>nul

REM 4. Remove Onboarding System
echo ❌ Removing onboarding system...
rmdir /s /q "app\(dashboard)\onboarding" 2>nul

REM 5. Remove Executor Welcome Page
echo ❌ Removing executor welcome page...
rmdir /s /q "app\executor" 2>nul

REM 6. Remove Cron Jobs
echo ❌ Removing cron jobs...
rmdir /s /q "app\api\cron" 2>nul

REM 7. Remove Family Flow API
echo ❌ Removing family flow API...
del "app\api\family\flow\route.ts" 2>nul

REM 8. Remove Voice Upload
echo ❌ Removing voice upload...
del "app\api\voice-upload\route.ts" 2>nul

REM 9. Remove Schedule Delivery
echo ❌ Removing schedule delivery...
del "app\api\schedule-delivery\route.ts" 2>nul

REM 10. Remove Test & Debug APIs
echo ❌ Removing test & debug APIs...
del "app\api\test-email\route.ts" 2>nul
del "app\api\test-monetization\route.ts" 2>nul
del "app\api\debug-billing\route.ts" 2>nul
del "app\api\fix-subscription\route.ts" 2>nul

REM 11. Remove Resend Webhook
echo ❌ Removing resend webhook...
del "app\api\webhooks\resend\route.ts" 2>nul

REM 12. Remove Emergency Actions
echo ❌ Removing emergency actions...
del "app\actions\emergency-actions.ts" 2>nul

REM 13. Remove Unsubscribe Page
echo ❌ Removing unsubscribe page...
rmdir /s /q "app\unsubscribe" 2>nul

echo ✅ Cleanup complete!
echo.
echo 📋 Remaining core features:
echo   ✅ Legacy Templates - /api/legacy-templates/
echo   ✅ Vault System - /app/(dashboard)/vault/
echo   ✅ Family Sharing - /app/(dashboard)/family/
echo   ✅ Settings - /app/(dashboard)/settings/
echo   ✅ Billing - Stripe integration
echo   ✅ Simple Dashboard - /components/dashboard/simple-dashboard.tsx
echo   ✅ User Stats - For streak tracking
echo   ✅ User Preferences - For personalization
echo.
echo 🚀 Next steps:
echo   1. Run: supabase/clean-minimal-schema.sql in Supabase
echo   2. Test core features
echo   3. Deploy to production

pause
