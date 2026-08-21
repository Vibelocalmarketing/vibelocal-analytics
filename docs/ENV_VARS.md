# Environment Variables

| Name | Purpose | Added to Vercel? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key (safe for browser) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key — server-only, bypasses RLS. Never expose to the browser. | No |
| `NEXT_PUBLIC_SITE_URL` | Base URL used to build the OAuth redirect (`http://localhost:3000` locally, the production URL on Vercel) | No |

All values currently live in `.env.local` (gitignored, not committed). Update
this table in the same commit that introduces a new env var, and check off
"Added to Vercel?" once it's set in the Vercel project settings.
