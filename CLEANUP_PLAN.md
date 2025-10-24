# 🧹 Cleanup Plan - Remove Unused Features

## ✅ KEEP (Working Features):
- **Legacy Templates** - `/api/legacy-templates/route.ts` ✅
- **Vault System** - `/app/(dashboard)/vault/page.tsx` ✅
- **Family Sharing** - `/app/(dashboard)/family/page.tsx` ✅
- **Settings** - `/app/(dashboard)/settings/page.tsx` ✅
- **Billing** - Stripe integration ✅
- **Simple Dashboard** - `/components/dashboard/simple-dashboard.tsx` ✅
- **User Stats** - For streak tracking ✅
- **User Preferences** - For personalization ✅

## ❌ DELETE (Unused Features):

### 1. Quiz & Engagement System
```
app/api/engagement/
├── stats/route.ts
└── quiz/route.ts
```

### 2. Table Talk System
```
app/api/table-talk/
├── generate/route.ts
└── play/route.ts

app/(dashboard)/table-talk/
└── page.tsx
```

### 3. Family Calendar & Tasks
```
app/api/events/
└── route.ts

app/api/tasks/
└── route.ts
```

### 4. Complex Devotional System
```
app/api/devotionals/
├── daily/route.ts
└── generate/route.ts

app/api/reflection/
└── daily/route.ts

app/api/study/
└── daily/route.ts

app/(dashboard)/devotional/
├── page.tsx
├── interactive/page.tsx
├── read/[book]/[chapter]/page.tsx
└── study/page.tsx

app/(dashboard)/reflections/
└── page.tsx

app/(dashboard)/study/
└── page.tsx
```

### 5. Onboarding System
```
app/(dashboard)/onboarding/
└── page.tsx
```

### 6. Executor Welcome Page
```
app/executor/
└── welcome/page.tsx
```

### 7. Cron Jobs
```
app/api/cron/
├── weekly-digest/route.ts
└── process-deliveries/route.ts
```

### 8. Family Flow API
```
app/api/family/flow/route.ts
```

### 9. Voice Upload
```
app/api/voice-upload/route.ts
```

### 10. Schedule Delivery
```
app/api/schedule-delivery/route.ts
```

### 11. Test & Debug APIs
```
app/api/test-email/route.ts
app/api/test-monetization/route.ts
app/api/debug-billing/route.ts
app/api/fix-subscription/route.ts
```

### 12. Webhook Handlers (Keep Stripe, remove others)
```
app/api/webhooks/
└── resend/route.ts
```

### 13. Emergency Actions
```
app/actions/emergency-actions.ts
```

### 14. Unsubscribe Page
```
app/unsubscribe/page.tsx
```

## 🎯 RESULT:
- **Clean, focused app** with only working features
- **No tech debt** from unused code
- **Faster builds** and deployments
- **Easier maintenance** and debugging
- **Clear feature set** for users

## 📋 EXECUTION ORDER:
1. **Run clean schema** - `supabase/clean-minimal-schema.sql`
2. **Delete unused files** - Remove all files listed above
3. **Test core features** - Ensure vault, family, settings still work
4. **Deploy** - Verify everything works in production
