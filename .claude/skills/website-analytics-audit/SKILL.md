---
name: website-analytics-audit
description: Audit whether a client website's Google Analytics (GA4) tracking is genuinely working — not just "is a property connected in the dashboard" but "is the live site actually sending real data to a property we can see." Use this whenever the user asks to check, verify, audit, or troubleshoot analytics/tracking for a specific client site, asks why a site shows no data or zero numbers in VibeLocal Analytics, mentions a domain isn't tracking, or wants to confirm phone clicks/form submissions/GA4 are working before or after a launch. Also trigger on requests like "is X tracking correctly", "why is there no data for X", "check the analytics setup for X", or "audit X's tracking" — even if the user doesn't say the word "audit". Reports findings in plain English, then asks before fixing anything, then walks through fixes step by step.
---

# Website Analytics Audit

A GA4 property showing up "Connected" in a dashboard, or a property existing with the client's name on it, proves nothing about whether real data is actually flowing. The single biggest recurring bug found across every real audit so far is a property that *looks* connected but is actually an empty decoy — the live site's real traffic goes somewhere else entirely, to a property nobody at the agency can see. Never trust what a dashboard or a "Connected" label claims; verify everything against the live site and the API directly.

This skill walks through that verification systematically, for any client domain, then — only with the user's go-ahead — fixes what's broken.

## Step 0 — Get the target and don't skip straight to fixing

Ask which domain to audit if it wasn't given (e.g. `njgoldstarconstruction.com`). Then look for a local project directory that holds that site's landing page code — this agency manages a family of client sites, each potentially in its own folder (e.g. `C:\Projects\LandingPageTest` held NJ Gold Star's Wix-embedded pages). Search for it (grep for the domain name, check `C:\Projects\*`) rather than assuming a path; not every domain will have one.

Work through Steps 1–7 fully before proposing any fix. Rex isn't a programmer — explain what you find in plain outcomes ("the site is sending data to the wrong property"), not code walkthroughs, and don't jump ahead to editing anything until Step 8 explicitly says to ask first.

## Step 1 — Find the GA4 property the agency already has connected

VibeLocal Analytics stores one shared GA4 OAuth connection (table `ga4_connection`, no per-user scoping — see the app's own `CLAUDE.md`). Read it with the service-role key, refresh the token, then list every property the connected Google account can see and find the one matching the target domain by name.

Run from `C:\Projects\VibeLocalAnalytics` with env vars loaded from `.env.local`:

```bash
set -a && source .env.local && set +a && node -e '
async function getToken() {
  const { createClient } = require("@supabase/supabase-js");
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await admin.from("ga4_connection").select("*").order("connected_at", { ascending: false }).limit(1).maybeSingle();
  console.log("Connected as:", data.google_email);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_GA4_CLIENT_ID,
      client_secret: process.env.GOOGLE_GA4_CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  return (await res.json()).access_token;
}
(async () => {
  const token = await getToken();
  const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", {
    headers: { Authorization: "Bearer " + token },
  });
  const data = await res.json();
  const props = [];
  for (const a of data.accountSummaries ?? []) for (const p of a.propertySummaries ?? [])
    props.push({ propertyId: p.property.replace("properties/", ""), displayName: p.displayName, accountName: a.displayName });
  console.log("Total properties visible:", props.length);
  console.log(JSON.stringify(props.filter(p => /TARGET_NAME/i.test(p.displayName) || /TARGET_NAME/i.test(p.accountName)), null, 2));
})();
' 2>&1
```

Replace `TARGET_NAME` with a fragment of the client's business name. For each match, get its real data stream(s):

```bash
# same token-fetching preamble, then:
fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/dataStreams`, { headers: { Authorization: "Bearer " + token } })
```

This returns the property's actual `measurementId` (e.g. `G-XXXXXXX`) and `defaultUri`. Note both — the `defaultUri` alone is often a tell: a property named after a staging/temp domain (like `d3l.034.mytemp.website`) that was never updated is a strong sign it's a decoy that was never actually wired to the live site.

## Step 2 — Find the REAL tag on the live site

Don't infer this from any dashboard. Fetch the actual live homepage HTML and read what's really there:

```bash
node -e '
fetch("https://TARGET_DOMAIN", { headers: { "User-Agent": "Mozilla/5.0" } })
  .then(r => r.text())
  .then(html => {
    const gtagScriptIds = [...new Set([...html.matchAll(/gtag\/js\?id=([A-Z0-9-]+)/g)].map(m => m[1]))];
    const configIds = [...new Set([...html.matchAll(/gtag\([\x27"]config[\x27"],\s*[\x27"]([A-Z0-9-]+)[\x27"]/g)].map(m => m[1]))];
    console.log(JSON.stringify({ gtagScriptIds, configIds }, null, 2));
  });
' 2>&1
```

You may see a `GT-` prefixed ID instead of `G-`. That's Google's newer unified "Google tag," which can fan out to multiple destinations (GA4, Ads) — its actual routing lives inside Google's systems (Google Ads → Tools → Data manager → Google tag, or Google Tag Manager), not in the page source. If you see `GT-`, note it but don't assume it maps to any specific `G-` property until you've checked the routing.

## Step 3 — Compare and diagnose

- **IDs match** → the plumbing is correct. Go to Step 4 to confirm real data is actually landing (a correct tag can still show zero data if nothing's happened yet, or if there's a separate access problem — check anyway).
- **IDs don't match** → this is the common case. The property visible in the dashboard is disconnected from the live site. Before proposing anything, check whether the *connected* Google account has access to the real property at all — loop every property from Step 1 through the dataStreams check and see if any of them owns the real measurement ID found in Step 2. If none do, this is an **access problem** (Step 8 has the fix paths), not something fixable by editing code alone.

## Step 4 — Confirm real data is actually flowing

A matching tag ID is necessary but not sufficient — verify traffic is real:

```js
// last 30 days
fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
  method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  body: JSON.stringify({ dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [], metrics: [{ name: "activeUsers" }, { name: "sessions" }] }),
});
// realtime, right now
fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
  method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
});
```

Zero data across 30 days with a freshly-fixed tag is expected, not a failure — note it and move on. Zero data with a tag that's supposedly been correct for a while is a real red flag worth surfacing.

## Step 5 — Test Phone Clicks and Form Submissions specifically

These two are the metrics most likely to silently fail even when Users/Sessions/PageViews look perfect, because they depend on custom JS event code firing correctly — not just the base tag loading. Verify each with a real action, not by reading historical data:

1. Use the browser tool to open the live site and actually click a `tel:` phone link (header is a good target — it's usually a shared element across every page, so one click there is representative of the whole site).
2. Immediately re-run the Realtime `eventName` breakdown (below) and confirm the count for a phone-classified event went up.
3. Use the browser tool to fill in and submit a real lead form with throwaway test data (fake name/phone/`test@example.com`), then re-check Realtime for a form-submission-classified event increase.

```js
fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
  method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  body: JSON.stringify({ dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }] }),
});
```

**Known gotcha, confirmed in a real audit:** Wix's native form GA4 integration fires an event literally named `generate_lead`, not `form_submit`. Check `lib/analytics/events.ts`'s `classifyEvent` function in this project — it must count `generate_lead` as a form submission, or the dashboard will show 0 Form Submissions for a site that's genuinely working. If a site's form fires some other unrecognized event name entirely, that's a new classifier gap worth fixing the same way (see Step 8).

If the site has more than one distinct form (e.g. a dedicated ad landing page form plus a separate `/contact-us` page form), test each one — they can be wired completely independently and one can work while the other doesn't.

`Add to Cart` will legitimately always read zero for a non-ecommerce lead-gen business. That's correct, not a bug — don't flag it.

## Step 6 — Check every page that matters, not just one

If the site has custom-built landing pages living as isolated Wix HTML iframe embeds (common pattern in this agency's work — a page split into 1-2 HTML embeds with a native Wix form in the gap between them), each embed has its **own separately hardcoded** `gtag` script, because iframes can't inherit the parent site's tag. A fix to the site-wide tag does not reach these. Grep the local project directory for the old measurement ID to find every file affected — there's often more than one (a header/hero embed and a content/footer embed, sometimes multiple landing page variants).

The regular pages (built with native Wix elements, not custom embeds) share one global header/footer, so testing the tag on one regular page is representative of all of them — no need to click through every single page in the sitemap.

## Step 7 — Report findings

Summarize per metric, plain language, no code:

| Metric | Status |
|---|---|
| Users / Sessions / Page Views | working / not working / no data yet |
| First Visits | ... |
| Phone Clicks | ... |
| Form Submissions | ... |
| Add to Cart | not applicable (skip if non-ecommerce) |
| Google Ads Clicks | ... |

State plainly *why* anything's broken (e.g. "the live site sends data to a different, inaccessible property") — not just that it is.

## Step 8 — Ask before fixing

If everything checks out, say so and stop. If something's broken, **ask the user whether they want it fixed now** before touching anything. This project's own `CLAUDE.md` has a standing rule: give step-by-step plain-English instructions and confirm each step is done before moving to the next — never silently make a batch of changes. That applies doubly here since fixes usually require the user to do things in an external dashboard (Wix, WordPress, Google Ads) that Claude can't reach directly.

### Fix pattern: tag mismatch on a WordPress site

Check the WP admin Plugins list and dashboard notices for an Analytics plugin — **Site Kit by Google** is common, and it often shows a "your site's URL has changed, please reconnect" notice that directly reveals the root cause (site moved from a staging/temp domain to production without reconnecting Analytics). Guide the user to Settings → reconnect, looking first (before any destructive action) for whether the original property appears in the account picker. If the original connecting Google account is unrecoverable, "Reset Site Kit" is a legitimate pragmatic fix — a clean slate under an account the agency controls — but flag that it also resets any other Site Kit-managed connections (Search Console, etc.), not just Analytics.

### Fix pattern: tag mismatch on a Wix site

Wix Dashboard → Settings → Marketing Integrations → Google Tag. This is often just a **plain pasted text field**, not an OAuth-locked connection — so it's safe to swap the ID to point at a property the agency's account already has full access to. Reusing an already-accessible decoy property (rather than creating a new one) is a valid, low-effort fix. After saving, remind the user Wix requires clicking through any confirmation dialog (it may offer to "run Google Ads campaigns" — decline unless that's actually wanted).

### Fix pattern: isolated landing page embeds still have the old ID

Read each affected file, replace the old measurement ID with the correct one (`sed` across all matches, verify none remain with a follow-up grep), then hand the user the full corrected code for each embed **one file at a time**, clearly labeled with which Wix HTML embed it goes into. After they confirm pasting each one, remind them Wix needs an explicit site-level **Publish** click — saving inside the embed's code panel alone does not push it live, and forgetting this step is the most common cause of "I pasted the fix but it's still broken."

### Fix pattern: access-only problem (no code can fix this)

If the real tag belongs to a Google account with no relation to anything the agency controls, there is no code fix. Either:
- Find out who administers the real property (ask the client directly — "who set up your Google Analytics?" is usually the fastest path) and have them grant the agency's connected account Viewer access, or
- As a pragmatic reset, point the live site's tag at a property the agency's account already fully controls, accepting that historical data under the old property is abandoned going forward.

## Step 9 — Verify the fix, same way you found the bug

After any fix that involves code, run `npm run build` in `C:\Projects\VibeLocalAnalytics` before calling it done — a Server Action or client/server boundary change needs the real build, not just a type check. Once the build passes, commit and push without asking each time (per this project's `CLAUDE.md`), then report what shipped.

For fixes that happen outside this codebase (Wix, WordPress, Google Ads settings), re-run Steps 2–5 for real — refetch the live page source, re-check Realtime, and if possible re-test the actual phone click / form submission with the browser tool. Don't declare a fix successful based on the user saying "I did it" alone; the whole point of this skill is not trusting claims that data is flowing without checking directly.
