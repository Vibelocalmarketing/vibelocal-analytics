import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveConnection } from "@/lib/google/ga4";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam || !code) {
    return NextResponse.redirect(
      `${siteUrl}/analytics/whole-site?ga4error=${errorParam ?? "missing-code"}`,
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
      client_secret: process.env.GOOGLE_GA4_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${siteUrl}/api/auth/ga4/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${siteUrl}/analytics/whole-site?ga4error=token-exchange-failed`,
    );
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.refresh_token) {
    // Happens if the user already granted access before without `prompt=consent`
    // forcing a fresh grant. Re-connecting always sends prompt=consent, so this
    // should be rare, but surface it clearly rather than silently storing nothing.
    return NextResponse.redirect(
      `${siteUrl}/analytics/whole-site?ga4error=no-refresh-token`,
    );
  }

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userInfo = await userInfoRes.json();

  await saveConnection(userInfo.email ?? "unknown", tokenData.refresh_token);

  return NextResponse.redirect(`${siteUrl}/analytics/whole-site?ga4connected=1`);
}
