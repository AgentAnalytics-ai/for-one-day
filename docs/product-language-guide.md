# Product Language Guide

## Purpose

This guide is the source of truth for user-facing language in For One Day.
Use it to keep product copy, emails, UI labels, and analytics events consistent.

Core rule: speak in a simple, warm, modern tone centered on memories and loved ones.

## One-Line Positioning

For One Day helps people capture meaningful memories for the people they love.

## Narrative Pillars

- Capture what matters now.
- Keep it organized by person.
- Revisit moments over time.
- Unlock Pro AI writing tools when needed.

## Approved Vocabulary

- memory / memories
- keepsake / keepsakes
- people you love
- private memory space
- notes and photos
- Pro AI writing tools
- organized by person
- timeline

## Deprecated Vocabulary (Do Not Use In User-Facing Copy)

- legacy vault
- legacy notes
- turn the page
- bible progress
- enhanced verses
- devotion journey
- family connections (as a product label)

Notes:
- Internal table names, route names, and historical API identifiers may still contain old words.
- Do not rename internal identifiers unless part of a dedicated migration.

## UX Copy Principles

- Keep copy outcome-focused: "what users can do now."
- Prefer concrete language over abstract inspiration.
- Avoid fear-based framing.
- Keep CTAs short and direct.
- Use sentence case for UI labels unless design requires otherwise.

## CTA Standards

- Primary CTA examples:
  - Start free
  - Save keepsake
  - View memories
  - Upgrade to Pro
- Avoid vague CTAs:
  - Begin your legacy
  - Preserve wisdom forever

## Plan and Monetization Language

- Free plan:
  - Focus on starting habit and core capture loop.
- Pro plan:
  - Emphasize unlimited keepsakes, advanced organization, and AI writing tools.
- AI policy:
  - If blocked on free: "AI writing tools are a Pro feature."

## GTM Event Naming Conventions

Use snake_case and product nouns from this guide.

Recommended events:

- memory_capture_started
- memory_person_selected
- memory_ai_attempted
- memory_ai_blocked_pro_required
- memory_ai_success
- memory_saved
- memories_viewed
- upgrade_viewed
- upgrade_checkout_started
- upgrade_success

Recommended shared properties:

- plan_tier: free | pro | lifetime
- ai_mode: grammar | expand
- source_surface: dashboard | memories | upgrade | onboarding

## Email and Notification Tone

- Warm and concise.
- Practical next step in every message.
- Avoid heavy "legacy" metaphors.
- Use consistent nouns: memories, keepsakes, people you love.

## PR and Review Checklist

Before merging copy changes, verify:

- No deprecated vocabulary in user-facing text.
- Pricing and plan text matches current product policy.
- AI gating copy matches server behavior.
- Metadata, landing page, and upgrade page use the same narrative.
- GTM event names use approved schema.

