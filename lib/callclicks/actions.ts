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

export async function updateEntry(id: string, formData: FormData) {
  const month = String(formData.get("month") ?? "").trim();
  if (!month) return;

  const { error } = await supabaseAdmin()
    .from("call_clicks_log")
    .update({
      log_month: month,
      google_ads_call_clicks: Number(formData.get("google_ads_call_clicks") ?? 0),
      website_call_clicks: Number(formData.get("website_call_clicks") ?? 0),
      gmb_call_clicks: Number(formData.get("gmb_call_clicks") ?? 0),
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/call-clicks");
}

export async function deleteEntry(id: string) {
  const { error } = await supabaseAdmin().from("call_clicks_log").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/call-clicks");
}

export async function moveEntry(entryIds: string[], entryId: string, direction: "up" | "down") {
  const index = entryIds.indexOf(entryId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= entryIds.length) return;

  const ordered = [...entryIds];
  [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];

  const admin = supabaseAdmin();
  // Plain per-row updates by primary key — NOT a bulk upsert. These rows
  // already exist, and property_id/log_month have no column defaults, so an
  // upsert re-inserting only {id, sort_order} would fail NOT NULL checks.
  for (const [i, id] of ordered.entries()) {
    const { error } = await admin.from("call_clicks_log").update({ sort_order: i }).eq("id", id);
    if (error) throw error;
  }

  revalidatePath("/call-clicks");
}
