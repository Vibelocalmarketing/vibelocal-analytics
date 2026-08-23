import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export const CHECKLIST_COLUMNS = [
  "users",
  "sessions",
  "page_views",
  "first_visits",
  "phone_clicks",
  "form_submissions",
  "add_to_cart",
  "google_ads_clicks",
] as const;

export type ChecklistColumn = (typeof CHECKLIST_COLUMNS)[number];
export type ChecklistRow = { property_id: string } & Record<ChecklistColumn, boolean>;
export type Note = { id: string; property_id: string; note: string; created_at: string };

export async function getChecklist(): Promise<Map<string, ChecklistRow>> {
  const { data, error } = await supabaseAdmin().from("integration_checklist").select("*");
  if (error) throw error;

  const map = new Map<string, ChecklistRow>();
  for (const row of (data ?? []) as ChecklistRow[]) {
    map.set(row.property_id, row);
  }
  return map;
}

export async function getAllNotes(): Promise<Map<string, Note[]>> {
  const { data, error } = await supabaseAdmin()
    .from("integration_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const map = new Map<string, Note[]>();
  for (const note of (data ?? []) as Note[]) {
    const list = map.get(note.property_id) ?? [];
    list.push(note);
    map.set(note.property_id, list);
  }
  return map;
}
