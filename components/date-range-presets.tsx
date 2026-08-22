import Link from "next/link";
import { presetRange, type PresetUnit } from "@/lib/analytics/period";

const PRESETS: { label: string; unit: PresetUnit }[] = [
  { label: "1 Day", unit: "1d" },
  { label: "7 Days", unit: "7d" },
  { label: "1 Month", unit: "1m" },
  { label: "1 Year", unit: "1y" },
];

export function DateRangePresets({
  pathname,
  currentParams,
}: {
  pathname: string;
  currentParams: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => {
        const { start, end } = presetRange(p.unit);
        const search = new URLSearchParams(
          Object.entries(currentParams).filter(
            (entry): entry is [string, string] => entry[1] !== undefined,
          ),
        );
        search.set("start", start);
        search.set("end", end);
        return (
          <Link
            key={p.unit}
            href={`${pathname}?${search.toString()}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
