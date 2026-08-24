"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { updateEntry, deleteEntry, moveEntry, addNote, updateNote, deleteNote } from "@/lib/callclicks/actions";
import type { CallClicksEntry, CallClickNote } from "@/lib/callclicks/db";
import { NotesPopover } from "@/components/notes-popover";

export function CallClickRow({
  entry,
  notes,
  orderedEntryIds,
  canMoveUp,
  canMoveDown,
}: {
  entry: CallClicksEntry;
  notes: CallClickNote[];
  orderedEntryIds: string[];
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const total = entry.google_ads_call_clicks + entry.website_call_clicks + entry.gmb_call_clicks;

  const inputClass = "w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900";

  if (editing) {
    return (
      <tr className="border-b border-slate-100 last:border-0 bg-indigo-50/40">
        <td colSpan={6} className="px-4 py-3">
          <form
            action={(formData: FormData) => {
              startTransition(async () => {
                await updateEntry(entry.id, formData);
                setEditing(false);
              });
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-500">Month</label>
              <input
                type="text"
                name="month"
                defaultValue={entry.log_month}
                className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-500">Google Ads</label>
              <input type="number" name="google_ads_call_clicks" min={0} defaultValue={entry.google_ads_call_clicks} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-500">Website</label>
              <input type="number" name="website_call_clicks" min={0} defaultValue={entry.website_call_clicks} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-500">GMB</label>
              <input type="number" name="gmb_call_clicks" min={0} defaultValue={entry.gmb_call_clicks} className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 font-medium text-slate-900">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isPending || !canMoveUp}
            onClick={() => startTransition(() => moveEntry(orderedEntryIds, entry.id, "up"))}
            aria-label="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500 disabled:opacity-20" />
          </button>
          <button
            type="button"
            disabled={isPending || !canMoveDown}
            onClick={() => startTransition(() => moveEntry(orderedEntryIds, entry.id, "down"))}
            aria-label="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500 disabled:opacity-20" />
          </button>
          <span>{entry.log_month}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-center text-slate-900">{entry.google_ads_call_clicks.toLocaleString()}</td>
      <td className="px-3 py-3 text-center text-slate-900">{entry.website_call_clicks.toLocaleString()}</td>
      <td className="px-3 py-3 text-center text-slate-900">{entry.gmb_call_clicks.toLocaleString()}</td>
      <td className="px-3 py-3 text-center font-semibold text-slate-900">{total.toLocaleString()}</td>
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <NotesPopover subjectId={entry.id} notes={notes} onAdd={addNote} onUpdate={updateNote} onDelete={deleteNote} />
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit entry">
            <Pencil className="h-4 w-4 text-slate-400 transition hover:text-indigo-500" />
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteEntry(entry.id))}
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4 text-slate-400 transition hover:text-red-500 disabled:opacity-40" />
          </button>
        </div>
      </td>
    </tr>
  );
}
