import { AlertTriangle } from "lucide-react";

export function TrackingAlert({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-4">
      {messages.map((message, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
}
