import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  deltaPct?: number | null;
}) {
  const positive = (deltaPct ?? 0) >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-3xl font-semibold text-transparent">
        {value}
      </div>
      {deltaPct !== undefined && deltaPct !== null && (
        <div
          className={`mt-2 flex items-center gap-1 text-sm font-medium ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {positive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {Math.abs(deltaPct).toFixed(1)}% vs comparison period
        </div>
      )}
    </div>
  );
}
