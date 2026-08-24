import { supabaseAdmin } from "@/lib/integration/db";

export type CallClicksEntry = {
  id: string;
  property_id: string;
  log_month: string;
  google_ads_call_clicks: number;
  website_call_clicks: number;
  gmb_call_clicks: number;
};

export async function getEntriesForProperty(propertyId: string): Promise<CallClicksEntry[]> {
  const { data, error } = await supabaseAdmin()
    .from("call_clicks_log")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []) as CallClicksEntry[];
}
