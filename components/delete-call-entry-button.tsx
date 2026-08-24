"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/lib/callclicks/actions";

export function DeleteCallEntryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteEntry(id))}
      aria-label="Delete entry"
      className="text-slate-400 transition hover:text-red-500 disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
