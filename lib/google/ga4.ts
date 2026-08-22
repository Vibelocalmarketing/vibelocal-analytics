import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getStoredConnection() {
  const { data, error } = await supabaseAdmin()
    .from("ga4_connection")
    .select("google_email, refresh_token, connected_at")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveConnection(googleEmail: string, refreshToken: string) {
  const admin = supabaseAdmin();
  // Single-connection app: clear any previous row before storing the new one.
  await admin.from("ga4_connection").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await admin
    .from("ga4_connection")
    .insert({ google_email: googleEmail, refresh_token: refreshToken });
  if (error) throw error;
}

async function getAccessToken(): Promise<string> {
  const connection = await getStoredConnection();
  if (!connection) throw new Error("Google Analytics is not connected yet.");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
      client_secret: process.env.GOOGLE_GA4_CLIENT_SECRET!,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Google access token: ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export type Ga4Property = {
  propertyId: string;
  displayName: string;
  accountName: string;
};

export async function listProperties(): Promise<Ga4Property[]> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    throw new Error(`Failed to list GA4 properties: ${await res.text()}`);
  }

  const data = await res.json();
  const properties: Ga4Property[] = [];

  for (const account of data.accountSummaries ?? []) {
    for (const property of account.propertySummaries ?? []) {
      properties.push({
        propertyId: property.property.replace("properties/", ""),
        displayName: property.displayName,
        accountName: account.displayName,
      });
    }
  }

  return properties;
}

export type RunReportParams = {
  propertyId: string;
  startDate: string;
  endDate: string;
  dimensions: string[];
  metrics: string[];
  dimensionFilter?: unknown;
};

export async function runReport(params: RunReportParams) {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${params.propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
        dimensions: params.dimensions.map((name) => ({ name })),
        metrics: params.metrics.map((name) => ({ name })),
        ...(params.dimensionFilter ? { dimensionFilter: params.dimensionFilter } : {}),
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`GA4 runReport failed: ${await res.text()}`);
  }

  return res.json();
}
