# Contributing

Thanks for your interest in For One Day.

## Before you start

1. **Environment** — Follow the [README](./README.md) and copy `.env.example` to `.env.local`. Do not commit env files.
2. **Product language** — See `docs/product-language-guide.md` for user-facing copy conventions.
3. **Security** — Read [SECURITY.md](./SECURITY.md). Do not open public issues for undisclosed vulnerabilities.

## Workflow

1. Fork the repository (if contributing from outside the core team).
2. Create a branch from `main` with a clear name (e.g. `fix/login-redirect`).
3. Make focused changes; match existing TypeScript, React, and Tailwind patterns.
4. Run `npm run lint` and `npm run type-check` before opening a pull request.
5. Open a PR with a short description of **what** changed and **why**.

## Documentation

- **Public product docs:** `README.md`, `docs/product-language-guide.md`
- **Internal / historical notes:** `docs/internal/` (checklists, audits, older plans—not required to build the app)

Questions are welcome via issues (for general discussion) or the contact options on [foroneday.app](https://foroneday.app).
