"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export function TrackingAlertIcon({ messages }: { messages: string[] }) {
  const [open, setOpen] = useState(false);

  if (messages.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tracking warning"
        className="inline-flex items-center justify-center text-amber-500 transition hover:text-amber-600"
      >
        <AlertTriangle className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-80 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-lg">
          <ul className="flex flex-col gap-2 text-sm text-amber-800">
            {messages.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
