import { LinkIcon } from "lucide-react";

export function Ga4ConnectBanner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
        <LinkIcon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        Connect Google Analytics
      </h2>
      <p className="max-w-sm text-sm text-slate-500">
        Connect your Google Analytics (GA4) account to see traffic data here.
      </p>
      <a
        href="/api/auth/ga4/connect"
        className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105 hover:shadow-indigo-500/50"
      >
        Connect Google Analytics
      </a>
    </div>
  );
}
