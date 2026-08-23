"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, CHECKLIST_COLUMNS } from "./db";

export async function saveChecklist(propertyIds: string[], formData: FormData) {
  const rows = propertyIds.map((propertyId) => {
    const row: Record<string, unknown> = {
      property_id: propertyId,
      updated_at: new Date().toISOString(),
    };
    for (const column of CHECKLIST_COLUMNS) {
      row[column] = formData.get(`${propertyId}__${column}`) === "on";
    }
    return row;
  });

  const { error } = await supabaseAdmin()
    .from("integration_checklist")
    .upsert(rows, { onConflict: "property_id" });
  if (error) throw error;

  revalidatePath("/integration-status");
}

export async function addNote(propertyId: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return;

  const { error } = await supabaseAdmin()
    .from("integration_notes")
    .insert({ property_id: propertyId, note: trimmed });
  if (error) throw error;

  revalidatePath("/integration-status");
}

export async function updateNote(id: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return;

  const { error } = await supabaseAdmin().from("integration_notes").update({ note: trimmed }).eq("id", id);
  if (error) throw error;

  revalidatePath("/integration-status");
}

export async function deleteNote(id: string) {
  const { error } = await supabaseAdmin().from("integration_notes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/integration-status");
}
