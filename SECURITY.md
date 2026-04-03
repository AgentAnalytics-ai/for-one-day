# Security

We take the safety of user data seriously. For One Day uses **Supabase Row Level Security (RLS)**, server-side checks for privileged actions, and **environment variables** for all secrets (never committed to this repository).

## Reporting a vulnerability

If you believe you have found a security issue, please **do not** open a public GitHub issue.

Instead, contact us with:

- A description of the issue and affected component
- Steps to reproduce (if possible)
- Any relevant logs or screenshots (redact personal data)

**Contact:** use the security contact or support channel listed on [foroneday.app](https://foroneday.app), or open a **private** security advisory via GitHub (**Security → Report a vulnerability**) if enabled for this repository.

We will acknowledge receipt and work with you on a coordinated disclosure timeline.

## Secure development practices

- Copy `.env.example` to `.env.local` and keep secrets **only** in local env files and in your host’s dashboard (e.g. Vercel).
- Never commit `.env`, `.env.*`, `.env.json`, or service-role keys.
- Prefer server-side validation for billing and AI features; rely on RLS for database access from the client.

Thank you for helping keep users safe.
