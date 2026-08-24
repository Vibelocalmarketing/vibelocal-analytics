import { supabaseAdmin } from "@/lib/integration/db";

export type CallClicksEntry = {
  id: string;
  property_id: string;
  log_month: string;
  google_ads_call_clicks: number;
  website_call_clicks: number;
  gmb_call_clicks: number;
  sort_order: number | null;
};

// Rows never explicitly reordered have sort_order = null — fall back to
// created_at desc (the order the DB query already returns), same fallback
// pattern used for property reordering on Integration Status.
export async function getEntriesForProperty(propertyId: string): Promise<CallClicksEntry[]> {
  const { data, error } = await supabaseAdmin()
    .from("call_clicks_log")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const entries = (data ?? []) as CallClicksEntry[];
  return [...entries].sort((a, b) => {
    const orderA = a.sort_order ?? entries.indexOf(a);
    const orderB = b.sort_order ?? entries.indexOf(b);
    return orderA - orderB;
  });
}
