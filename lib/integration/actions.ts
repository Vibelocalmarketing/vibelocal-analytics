"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, CHECKLIST_COLUMNS, getChecklist, orderPropertyIds } from "./db";

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

export async function toggleHidden(propertyId: string, hidden: boolean) {
  const { error } = await supabaseAdmin()
    .from("integration_checklist")
    .upsert({ property_id: propertyId, hidden }, { onConflict: "property_id" });
  if (error) throw error;

  revalidatePath("/integration-status");
}

export async function moveProperty(propertyIds: string[], propertyId: string, direction: "up" | "down") {
  const checklist = await getChecklist();
  const ordered = orderPropertyIds(propertyIds, checklist);

  const index = ordered.indexOf(propertyId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= ordered.length) return;

  [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];

  const rows = ordered.map((id, i) => ({ property_id: id, sort_order: i }));
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
