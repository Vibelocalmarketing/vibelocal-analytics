"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/integration/db";

export async function addEntry(propertyId: string, formData: FormData) {
  const month = String(formData.get("month") ?? "").trim();
  if (!month) return;

  const { error } = await supabaseAdmin().from("call_clicks_log").upsert(
    {
      property_id: propertyId,
      log_month: month,
      google_ads_call_clicks: Number(formData.get("google_ads_call_clicks") ?? 0),
      website_call_clicks: Number(formData.get("website_call_clicks") ?? 0),
      gmb_call_clicks: Number(formData.get("gmb_call_clicks") ?? 0),
    },
    { onConflict: "property_id,log_month" },
  );
  if (error) throw error;

  revalidatePath("/call-clicks");
}

export async function deleteEntry(id: string) {
  const { error } = await supabaseAdmin().from("call_clicks_log").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/call-clicks");
}
