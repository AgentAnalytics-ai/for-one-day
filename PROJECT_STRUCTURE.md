# For One Day - Project Structure

```
for-one-day/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Protected routes group
│   │   ├── dashboard/            # Today view with stats & devotion
│   │   ├── family/               # Family planning & tasks
│   │   ├── table-talk/           # Sunday game
│   │   ├── vault/                # Legacy storage
│   │   └── layout.tsx            # Authenticated layout + nav
│   ├── auth/                     # Authentication
│   │   ├── login/                # Login page
│   │   ├── callback/             # OAuth callback
│   │   └── actions.ts            # Server actions (login, signup, etc.)
│   ├── api/                      # API routes (will add)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # React Query provider
│
├── components/                   # React components
│   ├── auth/
│   │   └── login-form.tsx        # Auth form with magic link
│   └── dashboard/
│       └── nav.tsx               # Dashboard navigation
│
├── lib/                          # Core utilities
│   ├── supabase/
│   │   ├── server.ts             # Server-side Supabase client
│   │   ├── client.ts             # Browser Supabase client
│   │   └── middleware.ts         # Middleware helper
│   ├── ai.ts                     # OpenAI functions
│   ├── email.ts                  # Resend email templates
│   ├── env.ts                    # Type-safe env validation
│   └── utils.ts                  # Helper functions
│
├── supabase/                     # Database
│   ├── schema.sql                # Tables, indexes, functions
│   └── policies.sql              # Row-Level Security
│
├── middleware.ts                 # Next.js middleware (auth)
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
├── next.config.mjs               # Next.js config
├── package.json                  # Dependencies
│
├── README.md                     # Project overview
├── SETUP.md                      # Detailed setup guide
├── NEXT_STEPS.md                 # Quick start guide
└── PROJECT_STRUCTURE.md          # This file
```

## Key Files Explained

### Authentication Flow
1. User visits `/auth/login`
2. Enters email (magic link) or password
3. `app/auth/actions.ts` handles server-side auth
4. Callback to `/auth/callback/route.ts`
5. Redirects to `/dashboard`
6. `middleware.ts` refreshes session on every request

### Database Access
- **Server Components**: Use `createClient()` from `lib/supabase/server.ts`
- **Client Components**: Use `createClient()` from `lib/supabase/client.ts`
- **API Routes**: Use server client
- **Middleware**: Use `lib/supabase/middleware.ts`

### Environment Variables
- Validated by `lib/env.ts` using Zod
- Fails at build time if misconfigured
- Type-safe access: `env.OPENAI_API_KEY`

### Protected Routes
- All routes in `(dashboard)/` require authentication
- Layout checks auth and redirects if needed
- User profile fetched once per page load

## What to Build Next

### Phase 1: Core Devotional Experience
Add to `app/(dashboard)/dashboard/page.tsx`:
- Fetch today's theme from `devotion_themes`
- Display scripture + reflection
- Journal entry form → save to `devotion_entries`
- Show weekly progress (Mon-Sat)

Create `app/api/devotion/today/route.ts`:
- GET: Fetch today's devotional theme
- POST: Save daily journal entry

### Phase 2: Table Talk Game
Update `app/(dashboard)/table-talk/page.tsx`:
- Check if 6 entries completed
- "Generate Deck" button
- Game UI (flip cards, timer, scoreboard)

Create `app/api/table-talk/generate/route.ts`:
- POST: Get week's entries
- Call `generateTableTalkDeck()` from `lib/ai.ts`
- Save to `table_talk_decks`

### Phase 3: Family Features
Update `app/(dashboard)/family/page.tsx`:
- Calendar view component
- Task list with assignments
- Add/edit events and tasks

### Phase 4: Vault
Update `app/(dashboard)/vault/page.tsx`:
- File upload to Supabase Storage
- List vault items
- Download/preview

### Phase 5: Automation
Create `app/api/cron/weekly-digest/route.ts`:
- Vercel Cron: Sunday 10pm
- Generate summary with AI
- Send email via Resend

## Tech Stack Decisions

### Why Next.js 15?
- React Server Components (faster, less client JS)
- Server Actions (no API boilerplate)
- App Router (better file-based routing)
- Built-in optimization (images, fonts, etc.)

### Why Supabase?
- Postgres (powerful, relational)
- Row-Level Security (data privacy built-in)
- Real-time subscriptions (future: live updates)
- Storage (file uploads)
- Auth (email, OAuth, magic links)
- All in one platform

### Why Tailwind?
- Utility-first (fast prototyping)
- Responsive by default
- Easy dark mode
- Tiny production bundle

### Why TypeScript?
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Scales with team size

### Why Zod?
- Runtime validation
- Type inference (TS types from schemas)
- Great error messages
- Works server + client

## Architecture Principles

1. **Server-first**: Use Server Components by default
2. **Type-safe**: TypeScript strict mode + Zod validation
3. **Secure**: RLS policies + service role key never in browser
4. **Fast**: Edge middleware + optimized images
5. **Observable**: Error boundaries + logging (add Sentry later)
6. **Testable**: Pure functions + separated concerns

## Development Workflow

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Deployment Workflow

1. Push to GitHub
2. Vercel auto-deploys
3. Preview URLs for PRs
4. Merge to `main` → production

## Database Migrations

When you change the schema:
1. Edit `supabase/schema.sql`
2. Run in Supabase SQL Editor
3. Test locally with dev data
4. Deploy to production (copy to prod project)

(Later: Use Supabase CLI for proper migrations)

## Styling Guide

- **Headings**: `font-serif` (Georgia)
- **Body**: `font-sans` (Inter)
- **Primary color**: Orange/amber (`primary-500`)
- **Backgrounds**: Soft gradients (`from-orange-50`)
- **Cards**: `bg-white/70 backdrop-blur`
- **Spacing**: Consistent 4/8/12/16px scale
- **Shadows**: Subtle (`shadow-sm`, `shadow-lg`)

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: > 90

(Vercel Analytics + Lighthouse CI for monitoring)

---

**You're ready to build!** 🚀

