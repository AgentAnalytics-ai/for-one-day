# Monthly Cost Analysis - For One Day App

## 🏗️ Services Used

Based on your codebase, here are all the services you're using:

1. **Vercel** - Hosting & Deployment
2. **Supabase** - Database, Auth, Storage
3. **OpenAI** - AI features (Table Talk, summaries)
4. **Resend** - Email sending
5. **Stripe** - Payments (when enabled)
6. **OneSignal** - Push notifications (optional, not implemented yet)

---

## 💰 Cost Breakdown

### 1. Vercel (Hosting) - **FREE to $20/month**

**Free Tier (Hobby):**
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (100GB-hours/month)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments

**Pro Tier ($20/month):**
- Everything in Free +
- Team collaboration
- More bandwidth (1TB)
- More function hours
- Analytics included
- Priority support

**Your Usage:**
- Next.js app with server components
- API routes for reflections, vault, etc.
- Image optimization
- **Estimated: FREE (Hobby plan is sufficient for most apps)**

**When you'd need Pro:**
- Team of 2+ developers
- Need more bandwidth (>100GB/month)
- Need analytics dashboard

---

### 2. Supabase - **FREE to $25/month**

**Free Tier:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ Email auth (50,000/month)

**Pro Tier ($25/month):**
- 8GB database
- 100GB file storage
- 250GB bandwidth
- 100,000 monthly active users
- Daily backups
- Email support

**Your Usage:**
- Database: Profiles, reflections, vault items, families
- Storage: Media (reflection photos), vault files
- Auth: User authentication
- **Estimated: FREE for <100 users, $25/month for growth**

**Storage Calculation:**
- Average reflection photo: ~500KB
- Average vault file: ~2MB
- 100 users, 30 reflections/month = 1.5GB photos
- 100 users, 5 vault items = 1GB vault
- **Total: ~2.5GB (Free tier: 1GB, need Pro)**

---

### 3. OpenAI - **Pay-as-you-go**

**Model Used:** `gpt-4o-mini` (from your code)

**Pricing:**
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**Your Usage:**
1. **Table Talk Deck Generation** (weekly, per user)
   - ~500 tokens input (7 entries)
   - ~1000 tokens output (7 cards)
   - Cost: ~$0.0006 per generation
   - 100 users = $0.06/week = **$0.24/month**

2. **Weekly Summary** (weekly, per user)
   - ~500 tokens input
   - ~300 tokens output
   - Cost: ~$0.0003 per generation
   - 100 users = $0.03/week = **$0.12/month**

3. **Devotional Generation** (if implemented)
   - Similar costs

**Estimated Monthly Cost:**
- 10 users: **$0.04/month**
- 100 users: **$0.36/month**
- 1,000 users: **$3.60/month**
- 10,000 users: **$36/month**

**Very affordable!** OpenAI is cheap for this use case.

---

### 4. Resend - **FREE to $20/month**

**Free Tier:**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ API access
- ✅ Email logs

**Pro Tier ($20/month):**
- 50,000 emails/month
- Unlimited API access
- Priority support
- Custom domains

**Your Usage:**
1. **Welcome emails** - 1 per new user
2. **Weekly digest** - 1 per user per week
3. **Legacy note sharing** - Variable (user-initiated)
4. **Emergency access notifications** - Rare

**Calculation:**
- 100 users
- 4 new users/week = 16 welcome emails/month
- 100 users × 4 weeks = 400 weekly digests/month
- 20 legacy shares/month
- **Total: ~436 emails/month = FREE tier**

**Estimated: FREE for <3,000 emails/month**

---

### 5. Stripe - **2.9% + $0.30 per transaction**

**Free to use** (only pay when you get paid)

- No monthly fee
- 2.9% + $0.30 per successful charge
- Only charged when users subscribe

**Your Usage:**
- Pro plan subscriptions
- **Cost: Only when you have paying customers**
- If 10 users pay $10/month = $100 revenue
- Stripe fee = $3.20 (3.2%)
- **You keep: $96.80**

---

### 6. OneSignal - **FREE (not implemented yet)**

**Free Tier:**
- ✅ 10,000 subscribers
- ✅ Unlimited notifications
- ✅ Web, iOS, Android

**Cost: FREE** (when you implement it)

---

## 📊 Total Monthly Cost Estimate

### Scenario 1: Starting Out (<100 users)
- **Vercel**: FREE
- **Supabase**: FREE
- **OpenAI**: $0.36/month
- **Resend**: FREE
- **Stripe**: $0 (no payments yet)
- **OneSignal**: $0 (not implemented)
- **Total: ~$0.36/month** 💰

### Scenario 2: Growing (100-500 users)
- **Vercel**: FREE (or $20 if team)
- **Supabase**: $25/month (need more storage)
- **OpenAI**: $1.80/month
- **Resend**: FREE
- **Stripe**: Variable (only when paid)
- **OneSignal**: FREE
- **Total: ~$27-47/month** 💰

### Scenario 3: Scaling (1,000+ users)
- **Vercel**: $20/month (Pro)
- **Supabase**: $25/month (Pro)
- **OpenAI**: $3.60/month
- **Resend**: $20/month (if >3,000 emails)
- **Stripe**: Variable
- **OneSignal**: FREE
- **Total: ~$69/month** 💰

### Scenario 4: Large Scale (10,000+ users)
- **Vercel**: $20/month
- **Supabase**: $25/month (or higher tier)
- **OpenAI**: $36/month
- **Resend**: $20/month
- **Stripe**: Variable
- **OneSignal**: FREE
- **Total: ~$101/month** 💰

---

## 🎯 Cost Optimization Tips

### 1. **Supabase Storage**
- Compress images before upload (reduce from 500KB to 100KB)
- Use image optimization (Next.js does this automatically)
- Clean up old media files periodically
- **Savings: Stay on Free tier longer**

### 2. **OpenAI**
- Cache AI responses when possible
- Use `gpt-4o-mini` (you're already doing this ✅)
- Batch requests when possible
- **Already optimized!**

### 3. **Resend**
- Only send emails to active users
- Batch weekly digests efficiently
- **Already optimized!**

### 4. **Vercel**
- Use static generation where possible (you're doing this ✅)
- Optimize images (Next.js Image component ✅)
- **Already optimized!**

---

## 💡 Key Insights

1. **Very affordable to start**: <$1/month for first 100 users
2. **Supabase is the main cost**: $25/month when you need Pro
3. **OpenAI is cheap**: Even at scale, <$40/month
4. **Vercel is free**: Until you need team features
5. **Resend is free**: Until >3,000 emails/month

---

## 🚨 When Costs Spike

**Watch out for:**
1. **Supabase storage**: If users upload lots of photos/videos
2. **Resend**: If you send too many emails (>3,000/month)
3. **Vercel bandwidth**: If you get viral traffic (>100GB/month)
4. **OpenAI**: If you add more AI features

**Mitigation:**
- Set limits on file uploads (you already do: 5MB images)
- Monitor email sending
- Use Vercel Analytics to track bandwidth
- Cache AI responses

---

## 📈 Revenue vs Cost

**If you charge $10/month for Pro:**
- 10 paying users = $100 revenue
- Costs = ~$27/month
- **Profit: $73/month** ✅

- 100 paying users = $1,000 revenue
- Costs = ~$69/month
- **Profit: $931/month** ✅

**Very healthy margins!**

---

## ✅ Final Answer

**Starting out (<100 users): ~$0.36/month**
**Growing (100-500 users): ~$27-47/month**
**Scaling (1,000+ users): ~$69/month**

**Most likely scenario for you: $0-25/month** depending on user count and storage usage.

The app is **very cost-effective** to run! 🎉

