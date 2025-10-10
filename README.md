# For One Day

> Live today. Prepare for the day that matters most.

A beautiful, purposeful app for fathers to build daily rhythms of devotion, family connection, and lasting legacy.

## 🎯 What is For One Day?

For One Day helps fathers:
- Complete a **3-minute daily devotion** (Mon-Sat) with guided journal prompts
- Play **Table Talk** - an AI-generated conversation game on Sundays made from your week's reflections
- Organize **family planning** with a shared calendar and task system
- Store **legacy documents** in a private Vault - letters, videos, and important files for your family

## 🏗️ Tech Stack

**Modern, Fast, Production-Ready (2026 best practices)**

- **Framework**: Next.js 15 (App Router, React 19, Server Components)
- **Database**: Supabase (Postgres, Auth, Storage, Real-time, RLS)
- **Styling**: Tailwind CSS
- **AI**: OpenAI (gpt-4o-mini for devotion summaries & Table Talk decks)
- **Email**: Resend (transactional + weekly digests)
- **Payments**: Stripe (when ready)
- **Deployment**: Vercel
- **Type Safety**: TypeScript + Zod

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account (free tier works)
- OpenAI API key (optional for AI features)
- Resend account (optional for emails)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/for-one-day.git
   cd for-one-day
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase/schema.sql` in the SQL editor
   - Run the SQL from `supabase/policies.sql` for Row-Level Security
   - Create two storage buckets: `media` (private) and `vault` (private)

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then fill in your keys in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `RESEND_API_KEY` - Your Resend API key (optional)

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
for-one-day/
├── app/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Today view
│   │   ├── family/          # Family planning
│   │   ├── table-talk/      # Sunday game
│   │   └── vault/           # Legacy storage
│   ├── auth/                # Authentication pages
│   ├── api/                 # API routes (will add)
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── auth/
│   └── dashboard/
├── lib/                     # Core utilities
│   ├── supabase/            # Database clients
│   ├── ai.ts                # OpenAI prompts
│   ├── email.ts             # Email templates
│   └── env.ts               # Type-safe env vars
├── supabase/                # Database schema & policies
└── public/                  # Static assets
```

## 🔐 Environment Variables

See `.env.example` for all required and optional variables.

**Required**:
- Supabase credentials
- `NEXT_PUBLIC_SITE_URL`

**Optional** (features work without these):
- `OPENAI_API_KEY` - AI-generated summaries and Table Talk decks
- `RESEND_API_KEY` - Weekly digest emails
- `STRIPE_*` - Payment processing (Pro plan)
- `ONESIGNAL_*` - Push notifications

## 📊 Database Schema

The app uses Supabase Postgres with Row-Level Security (RLS) enabled.

**Core tables**:
- `profiles` - User profiles and plan status
- `families` - Family groups
- `family_members` - Family membership (owner/spouse/child)
- `devotion_themes` - Weekly devotional content
- `devotion_entries` - Personal journal entries (Mon-Sat)
- `table_talk_decks` - AI-generated Sunday game decks
- `events` - Family calendar
- `tasks` - Family task list
- `vault_items` - Legacy documents metadata
- `subscriptions` - Stripe billing (when implemented)

See `supabase/schema.sql` for full schema and `supabase/policies.sql` for RLS policies.

## 🎨 Design Philosophy

- **Calm & purposeful** - Serif headings, soft gradients, minimal UI
- **Mobile-first** - Works beautifully on phones and tablets
- **Fast by default** - Server Components, edge functions, optimized images
- **Privacy-first** - RLS everywhere, encrypted vault, no tracking without consent

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/for-one-day.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Set up custom domain**
   - Add `foroneday.app` in Vercel domain settings
   - Update DNS records as instructed
   - Update `NEXT_PUBLIC_SITE_URL` to production URL

## 🛣️ Roadmap

### Phase 1: Core Experience (Current)
- [x] Project setup & infrastructure
- [x] Authentication flow
- [x] Landing page
- [x] Dashboard shell
- [ ] Daily devotion reader + journal
- [ ] Weekly progress tracking
- [ ] Table Talk generator + game UI

### Phase 2: Family Features
- [ ] Family calendar
- [ ] Task management
- [ ] Family member invites
- [ ] Points/gamification

### Phase 3: Legacy & Vault
- [ ] File upload to Vault
- [ ] Client-side encryption (optional)
- [ ] Video/audio recording
- [ ] Blessing archive

### Phase 4: Growth & Monetization
- [ ] Stripe integration (Pro plan)
- [ ] Weekly digest emails
- [ ] Push notifications
- [ ] Analytics & metrics
- [ ] Admin content management

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

Open an issue or reach out via [foroneday.app](https://foroneday.app)

## 📄 License

© 2025 Agent Analytics. All rights reserved.

---

**For One Day** - A project by Agent Analytics

