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

### `integration_checklist`

One row per GA4 property (`property_id`), tracking Rex's manual "have I
verified this metric fires correctly" checklist for the Integration Status
page. Purely a personal checklist — not derived from real tracking data.
Also holds `hidden` (eye-icon toggle, for archiving inactive sites off the
table) and `sort_order` (up/down arrow reordering; `null` means "not yet
reordered, fall back to GA4's natural property order").

```sql
create table integration_checklist (
  property_id text primary key,
  users boolean not null default false,
  sessions boolean not null default false,
  page_views boolean not null default false,
  first_visits boolean not null default false,
  phone_clicks boolean not null default false,
  form_submissions boolean not null default false,
  add_to_cart boolean not null default false,
  google_ads_clicks boolean not null default false,
  updated_at timestamptz not null default now()
);

revoke all on integration_checklist from anon, authenticated;
alter table integration_checklist enable row level security;
-- No policies: service-role client only, never read from the browser.

alter table integration_checklist add column hidden boolean not null default false;
alter table integration_checklist add column sort_order integer;
```

No foreign key to `auth.users`, so nothing to add to `lib/auth/delete-account.ts`.

### `integration_notes`

Free-form notes attached to a GA4 property (`property_id`), shown in the
Integration Status page's per-site notes popup. Multiple notes per property,
each individually addable/editable/deletable.

```sql
create table integration_notes (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);

revoke all on integration_notes from anon, authenticated;
alter table integration_notes enable row level security;
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
