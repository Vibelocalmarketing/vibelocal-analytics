# Database

Source of truth for the Supabase schema — there's no migration tooling, so every
change to a table gets recorded here at the time it's made.

## Tables

No custom tables yet. Auth is fully handled by Supabase's built-in `auth.users`
table (email/password + Google OAuth), which we don't manage directly.

When the first app table is added:
- Record its purpose, columns, and RLS policy here with the exact SQL.
- Default: `revoke all on <table> from anon, authenticated`, RLS enabled,
  service-role client only — unless a user genuinely needs to read their own
  row, in which case add one explicit policy for exactly that.
- If it has a foreign key to `auth.users`, add its cleanup to
  `lib/auth/delete-account.ts` in the same commit.
