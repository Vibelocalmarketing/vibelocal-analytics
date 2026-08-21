# VibeLocal Analytics

## Stack
Next.js (App Router, TypeScript, Tailwind), hosted on Vercel. Database + auth on Supabase (Postgres, RLS-protected).

## Ground rules

- No premature abstraction. Don't build for hypothetical future requirements. Three similar lines beats a speculative shared helper.
- Minimal comments. Only when the WHY is non-obvious — a hidden constraint, a workaround, a subtle invariant.
- Track every schema change in `docs/DATABASE.md` as we go — table purpose, columns, RLS policy, and the exact SQL that created it. This is the only record of the schema since there's no migration tooling.
- Default every new table to locked down: `revoke all on <table> from anon, authenticated`; plus RLS enabled, service-role client only — unless a user genuinely needs to read their own row, in which case add one explicit policy for exactly that.
- `tsc --noEmit` is not enough to verify a change compiles. Run the real `npm run build` before calling anything involving a Server Action or a new client/server import boundary "done."
- Supabase's `signUp()` returns a fake success (empty identities, no error) when the email is already registered. Every signup flow needs to check for this explicitly, not trust the absence of an error.
- Keep one centralized account-deletion function from day one. Every new table with a foreign key to `auth.users` gets added to it immediately when the table is created — not remembered later.
- Rex is on Windows, Vercel builds on Linux. Filename casing that looks fine locally can break the production build. Watch for this on any new component file.
- After a change is verified working, commit and push without asking each time — just report what shipped.
- Rex is not a programmer. Explain outcomes in plain English, not code walkthroughs, unless he asks to see the code.
- Before building anything, give step-by-step instructions in plain English, one step at a time. Confirm each step is done (or that Rex has done his part, like adding an env var) before moving to the next one. Don't just start coding silently.
- Centralize security-relevant checks in one shared function — signup validation, permission checks, anything like that. Never hand-copy the same check into multiple flows.
- When fixing one instance of a pattern, grep for every other instance and fix them all in the same commit.
- After pushing, "live" means the Vercel deployment succeeded, not that the local build passed. Check the Deployments tab if something doesn't show up — don't assume it's just caching.
- Keep a running table of env vars in the docs — name, purpose, and whether it's been added to Vercel yet — updated in the same commit that introduces a new one.

## First build target (skeleton)

Stop and confirm with Rex once this round-trip works end to end, verified with a real test account, before building anything further:

1. Simple homepage (clean landing page, not fancy yet).
2. Email/password signup and login via Supabase Auth.
3. Bare authenticated page after login — proof session persists.
4. Real `/privacy` and `/terms` pages describing what this app actually collects (email, name).
5. One throwaway test account, credentials given to Rex, and used by Claude to verify the flow directly rather than assuming it works.

Google sign-in was deliberately skipped for this build (2026-08-22) — email/password only. Can be added later via Supabase's Google provider if needed.
