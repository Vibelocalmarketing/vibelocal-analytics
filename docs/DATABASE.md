# Database

Source of truth for the Supabase schema — there's no migration tooling, so every
change to a table gets recorded here at the time it's made.

## Tables

### `ga4_connection`

Stores the single Google OAuth connection used to pull Google Analytics (GA4)
data. Single-tenant app (Rex's own client sites), so this is expected to hold
at most one row at a time — connecting again overwrites the previous row.

```sql
create table ga4_connection (
  id uuid primary key default gen_random_uuid(),
  google_email text not null,
  refresh_token text not null,
  connected_at timestamptz not null default now()
);

revoke all on ga4_connection from anon, authenticated;
alter table ga4_connection enable row level security;
-- No policies: service-role client only, never read from the browser.
```

No foreign key to `auth.users`, so nothing to add to `lib/auth/delete-account.ts`.

## Adding the next table

- Record its purpose, columns, and RLS policy here with the exact SQL.
- Default: `revoke all on <table> from anon, authenticated`, RLS enabled,
  service-role client only — unless a user genuinely needs to read their own
  row, in which case add one explicit policy for exactly that.
- If it has a foreign key to `auth.users`, add its cleanup to
  `lib/auth/delete-account.ts` in the same commit.
