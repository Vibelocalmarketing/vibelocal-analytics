"use client";

import { useTransition } from "react";
import { Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { toggleHidden, moveProperty } from "@/lib/integration/actions";

export function IntegrationRowControls({
  propertyId,
  hidden,
  orderedPropertyIds,
  canMoveUp,
  canMoveDown,
}: {
  propertyId: string;
  hidden: boolean;
  orderedPropertyIds: string[];
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isPending || !canMoveUp}
        onClick={() => startTransition(() => moveProperty(orderedPropertyIds, propertyId, "up"))}
        aria-label="Move up"
      >
        <ChevronUp className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500 disabled:opacity-20" />
      </button>
      <button
        type="button"
        disabled={isPending || !canMoveDown}
        onClick={() => startTransition(() => moveProperty(orderedPropertyIds, propertyId, "down"))}
        aria-label="Move down"
      >
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500 disabled:opacity-20" />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleHidden(propertyId, !hidden))}
        aria-label={hidden ? "Show site" : "Hide site"}
      >
        {hidden ? (
          <EyeOff className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-slate-400 transition hover:text-indigo-500" />
        )}
      </button>
    </div>
  );
}
