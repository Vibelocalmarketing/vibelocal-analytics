export type Granularity = "day" | "week" | "month" | "year";

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function shiftDate(date: Date, granularity: Granularity, amount: number): Date {
  const d = new Date(date);
  switch (granularity) {
    case "day":
      d.setUTCDate(d.getUTCDate() - amount);
      break;
    case "week":
      d.setUTCDate(d.getUTCDate() - amount * 7);
      break;
    case "month":
      d.setUTCMonth(d.getUTCMonth() - amount);
      break;
    case "year":
      d.setUTCFullYear(d.getUTCFullYear() - amount);
      break;
  }
  return d;
}

export function defaultRangeFor(granularity: Granularity): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);

  switch (granularity) {
    case "day":
      start.setUTCDate(start.getUTCDate() - 29);
      break;
    case "week":
      start.setUTCDate(start.getUTCDate() - 7 * 12);
      break;
    case "month":
      start.setUTCDate(1);
      start.setUTCMonth(start.getUTCMonth() - 11);
      break;
    case "year":
      start.setUTCFullYear(start.getUTCFullYear() - 2, 0, 1);
      break;
  }

  return { start: formatDate(start), end: formatDate(end) };
}

export function formatRangeLabel(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const s = parseDate(start).toLocaleDateString("en-US", opts);
  const e = parseDate(end).toLocaleDateString("en-US", opts);
  return start === end ? s : `${s} – ${e}`;
}

export type PresetUnit = "1d" | "7d" | "1m" | "1y";

export function presetRange(unit: PresetUnit): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  switch (unit) {
    case "1d":
      break;
    case "7d":
      start.setUTCDate(start.getUTCDate() - 6);
      break;
    case "1m":
      start.setUTCMonth(start.getUTCMonth() - 1);
      break;
    case "1y":
      start.setUTCFullYear(start.getUTCFullYear() - 1);
      break;
  }
  return { start: formatDate(start), end: formatDate(end) };
}

export type CompareMode = "none" | "previous" | "yoy";

export function comparisonRange(
  start: string,
  end: string,
  mode: CompareMode,
): { start: string; end: string } | null {
  if (mode === "none") return null;

  if (mode === "yoy") {
    return {
      start: formatDate(shiftDate(parseDate(start), "year", 1)),
      end: formatDate(shiftDate(parseDate(end), "year", 1)),
    };
  }

  // "Previous period" always shifts back by the length of the currently
  // selected range itself, so it means "the period immediately before
  // this one, same length."
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const spanDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

  return {
    start: formatDate(shiftDate(startDate, "day", spanDays)),
    end: formatDate(shiftDate(endDate, "day", spanDays)),
  };
}
