# 🔐 Environment Variables Setup Guide

## Required Environment Variables

Copy these into your `.env.local` file with your actual values.

### Supabase (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```
**Get from:** https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

### Site Configuration (Required)
```env
NEXT_PUBLIC_SITE_URL=https://foroneday.app
```
Use `http://localhost:3000` for local development

### Stripe (Required for Payments)
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
**Get from:** https://dashboard.stripe.com/apikeys

**Note:** Use `sk_test_` and `pk_test_` for testing, `sk_live_` and `pk_live_` for production

### OpenAI (Optional - for AI features)
```env
OPENAI_API_KEY=sk-xxxxx
```
**Get from:** https://platform.openai.com/api-keys

### Resend (Optional - for emails)
```env
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@foroneday.app
```
**Get from:** https://resend.com/api-keys

### PostHog (Optional - for analytics)
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```
**Get from:** https://app.posthog.com/project/settings

### Sentry (Optional - for error monitoring)
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```
**Get from:** https://sentry.io/settings/projects/

### Cron Secret (Optional)
```env
CRON_SECRET=your-random-secret-here
```
Generate a random string for security

### Node Environment
```env
NODE_ENV=development
```
Set to `production` in production environment

---

## Quick Setup

1. Copy `.env.local.example` to `.env.local` (or create it)
2. Fill in all `REQUIRED` variables
3. Add optional variables as needed
4. Restart development server: `npm run dev`

## Testing Stripe Locally

Use Stripe CLI to test webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

## Vercel Deployment

Add all environment variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

