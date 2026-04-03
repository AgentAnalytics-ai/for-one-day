# For One Day - Setup Guide

Welcome! This guide will walk you through getting **For One Day** running locally and deploying to production.

## ✅ What's Already Done

- ✅ Next.js 15 with TypeScript & Tailwind configured
- ✅ Type-safe environment variables (Zod validation)
- ✅ Supabase client setup (server + browser)
- ✅ Authentication flow (magic link + password + signup)
- ✅ Dashboard shell with protected routes
- ✅ Landing page with hero
- ✅ Git repository initialized
- ✅ Database schema & RLS policies ready
- ✅ AI integration (OpenAI)
- ✅ Email integration (Resend)

## 🚀 Next Steps to Launch

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
   - Name: `for-one-day`
   - Database Password: (save this!)
   - Region: Choose closest to you
3. Wait ~2 minutes for project to spin up

### 2. Run Database Setup

Once your project is ready:

1. Go to the **SQL Editor** in Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" ✅
4. Then copy and paste `supabase/policies.sql`
5. Click "Run" ✅

You should see: "Success. No rows returned"

### 3. Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create two buckets:
   - Name: `media`, Public: **OFF**
   - Name: `vault`, Public: **OFF**

### 4. Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (keep secret!)

### 5. Configure Environment Variables

You already have a `.env.local` file. Update it with your keys:

```bash
# Supabase - FROM STEP 4
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OpenAI (you mentioned you have a key)
OPENAI_API_KEY=sk-xxxxx

# Resend (you mentioned you have a key)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=hello@foroneday.app
```

### 6. Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Try:
1. ✅ Landing page loads
2. ✅ Click "Start Free" → goes to login
3. ✅ Sign up with email → creates account
4. ✅ Check Supabase → see profile + family created
5. ✅ Dashboard loads

### 7. Create GitHub Repository

1. Go to [github.com](https://github.com) → New Repository
   - Name: `for-one-day`
   - Private: ✅
   - Don't initialize with README (we already have one)
2. Copy the commands for "push an existing repository":

```bash
git remote add origin https://github.com/YOUR-USERNAME/for-one-day.git
git branch -M main
git push -u origin main
```

### 8. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. **Environment Variables**: Add all vars from `.env.local`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → change to `https://foroneday.app`
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
5. Click "Deploy" 🚀

Wait ~2 minutes. Your app is live!

### 9. Connect Custom Domain

1. In Vercel project settings → **Domains**
2. Add `foroneday.app`
3. Update your DNS with the records Vercel provides
   - Usually an A record: `76.76.21.21`
   - And CNAME for `www`: `cname.vercel-dns.com`
4. Wait ~5 minutes for DNS to propagate

### 10. Update Supabase Auth URLs

1. Go to Supabase **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://foroneday.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
3. Set **Site URL**: `https://foroneday.app`

## 🎯 What to Build Next

Now that the foundation is solid, here's the recommended build order:

### Week 1: Devotional Experience
- [ ] Daily devotion reader with scripture
- [ ] Journal entry form (text + optional audio)
- [ ] Streak tracking
- [ ] Weekly progress visualization
- [ ] "Complete week" trigger

### Week 2: Table Talk
- [ ] API route: `/api/table-talk/generate`
- [ ] Table Talk game UI (card deck)
- [ ] "Start Game" flow
- [ ] Scoreboard
- [ ] "Save blessing" to Vault

### Week 3: Family Planning
- [ ] Calendar view (week/month)
- [ ] Add/edit events
- [ ] Task list with assignments
- [ ] Points system
- [ ] Family member invites

### Week 4: Vault
- [ ] File upload to Supabase Storage
- [ ] Vault item list
- [ ] Download/preview
- [ ] Optional client-side encryption
- [ ] Video recording

### Week 5: Automation & Growth
- [ ] Weekly digest email (Resend)
- [ ] Cron job (Vercel Cron)
- [ ] Push notifications (OneSignal)
- [ ] Analytics (PostHog)
- [ ] Stripe integration

## 🔧 Troubleshooting

### "Invalid environment variables"
- Check `.env.local` has all required values
- Restart dev server after changing env vars

### "Failed to fetch" in browser
- Check Supabase URL and anon key are correct
- Check Supabase project is not paused

### Auth not working
- Verify redirect URLs in Supabase dashboard
- Check email provider (Supabase Auth → Email templates)

### TypeScript errors
```bash
npm run type-check
```

### Deploy failed
- Check all env vars are set in Vercel
- Check build logs for specific error
- Common: missing env vars

## 📚 Helpful Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

## 🎉 You're Ready!

The foundation is **solid and production-ready**. Everything is:
- ✅ Type-safe
- ✅ Secure (RLS policies)
- ✅ Fast (Server Components)
- ✅ Scalable (Serverless)

Build one feature at a time, test thoroughly, and ship incrementally. 

**Let's build For One Day!** 🚀

