/**
 * 🧠 Expert Analysis API
 * Provides AI-powered insights on 2026 AI trends, web app best practices, and UX excellence
 * Cost-optimized with 24-hour server-side caching
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExpertAnalysis, type ExpertAnalysis } from '@/lib/ai'

// Simple in-memory cache (24 hours) - Cost optimization
const cache = new Map<string, { data: ExpertAnalysis; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function getCacheKey(question?: string): string {
  return question ? `expert-${question.toLowerCase().trim()}` : 'expert-default'
}

function cleanOldCacheEntries() {
  // Keep only last 10 entries to prevent memory bloat
  if (cache.size > 10) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
    cache.clear()
    entries.slice(0, 10).forEach(([key, value]) => cache.set(key, value))
  }
}

// Codebase context - key information about the app
const CODEBASE_CONTEXT = `
For One Day - An inclusive legacy preservation and daily reflection app

IMPORTANT: This app is designed for ALL users - not gender-specific. It was recently updated from a father-focused app to be inclusive of everyone (spouses, parents, grandparents, individuals, etc.). The "loved ones" system replaced the old "children" system to be inclusive of anyone (spouse, children, family, friends).

CORE FEATURES:
- Daily devotional reflections with Bible verses (inclusive, not gender-specific)
- Secure vault for legacy documents (letters, videos, files)
- Scheduled delivery system for legacy messages to loved ones
- Loved ones management system (spouse, children, family, friends - inclusive)
- Family planning and task management
- Table Talk game (AI-generated Sunday family game)
- Emergency access system for legacy documents

ARCHITECTURE:
- Next.js 15 App Router with React Server Components
- Supabase for database, auth, and storage
- Row-Level Security (RLS) for data privacy
- TypeScript with strict mode
- Zod for runtime validation
- Tailwind CSS for styling
- OpenAI integration for AI features
- Resend for transactional emails
- Stripe for payments (Pro plan)

CURRENT STATE:
- Authentication flow complete
- Dashboard with daily reflections
- Vault system for legacy storage
- Loved ones system (inclusive - replaced old children system)
- Settings and profile management
- Subscription management (Stripe)
- Emergency access workflow
- Email notifications

TECHNICAL HIGHLIGHTS:
- Server-first architecture (minimal client JS)
- Type-safe environment variables
- Secure RLS policies
- Optimized for mobile-first
- Edge-ready deployment
- Inclusive design (no gender-specific assumptions)

NOTE: Some legacy code may still contain father-specific language that needs updating to be fully inclusive.
`

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { question } = await request.json().catch(() => ({ question: undefined }))
    const cacheKey = getCacheKey(question)

    // Check cache first (cost optimization)
    const cached = cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        analysis: cached.data,
        generatedAt: new Date(cached.timestamp).toISOString(),
        cached: true
      })
    }

    // Generate new analysis (only if cache miss)
    const analysis = await generateExpertAnalysis(CODEBASE_CONTEXT, question)

    // Cache it for 24 hours
    cache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    })

    // Clean old entries periodically
    cleanOldCacheEntries()

    return NextResponse.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Expert analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate expert analysis' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for quick insights without question
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cacheKey = getCacheKey()

    // Check cache first (cost optimization)
    const cached = cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        analysis: cached.data,
        generatedAt: new Date(cached.timestamp).toISOString(),
        cached: true
      })
    }

    // Generate new analysis (only if cache miss)
    const analysis = await generateExpertAnalysis(CODEBASE_CONTEXT)

    // Cache it for 24 hours
    cache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    })

    // Clean old entries periodically
    cleanOldCacheEntries()

    return NextResponse.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Expert analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate expert analysis' 
      },
      { status: 500 }
    )
  }
}

