# Environment Variables

| Name | Purpose | Added to Vercel? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key (safe for browser) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key — server-only, bypasses RLS. Never expose to the browser. | No |
| `NEXT_PUBLIC_SITE_URL` | Base URL used to build the signup confirmation redirect (`http://localhost:3000` locally, `https://vibelocal-analytics.vercel.app` on Vercel) | Yes |
| `GOOGLE_GA4_CLIENT_ID` | OAuth client ID for the Google Analytics Data API connection (Google Cloud project `vibelocal-analytics`, owned by `admin@vibelocalmarketing.com`) | **Needs adding** |
| `GOOGLE_GA4_CLIENT_SECRET` | OAuth client secret — server-only, never expose to the browser | **Needs adding** |

All values currently live in `.env.local` (gitignored, not committed). Update
this table in the same commit that introduces a new env var, and check off
"Added to Vercel?" once it's set in the Vercel project settings.
