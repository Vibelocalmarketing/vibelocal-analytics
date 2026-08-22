import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/ga4/callback`,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPE,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
