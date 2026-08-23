"use client";

import { useState, useTransition } from "react";
import { StickyNote, Pencil, Trash2, X, Check } from "lucide-react";
import { addNote, updateNote, deleteNote } from "@/lib/integration/actions";

type Note = { id: string; note: string; created_at: string };

export function IntegrationNotesPopover({ propertyId, notes }: { propertyId: string; notes: Note[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditDraft(note.note);
  }

  function saveEdit() {
    const id = editingId;
    const text = editDraft;
    if (!id) return;
    setEditingId(null);
    startTransition(() => updateNote(id, text));
  }

  function submitNewNote() {
    const text = newNote;
    if (!text.trim()) return;
    setNewNote("");
    startTransition(() => addNote(propertyId, text));
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notes"
        className="relative inline-flex items-center justify-center text-slate-400 transition hover:text-indigo-500"
      >
        <StickyNote className="h-4 w-4" />
        {notes.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-semibold text-white">
            {notes.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Notes</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                {editingId === n.id ? (
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-sm text-slate-900"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{n.note}</p>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={() => startEdit(n)} aria-label="Edit note">
                        <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startTransition(() => deleteNote(n.id))}
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-sm text-slate-900"
              rows={2}
            />
            <button
              type="button"
              onClick={submitNewNote}
              disabled={isPending || !newNote.trim()}
              className="self-end rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              Add note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
