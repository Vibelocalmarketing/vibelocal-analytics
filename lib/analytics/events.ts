export type EventRow = { eventName: string; count: number };
export type EventType = "phone" | "form_start" | "form_submit" | "other";

export function classifyEvent(eventName: string): EventType {
  const n = eventName.toLowerCase();
  if (n.includes("phone") || n.includes("call")) return "phone";
  if (n.includes("form") && n.includes("start")) return "form_start";
  if (n.includes("form") && (n.includes("submit") || n.includes("complete"))) return "form_submit";
  return "other";
}

export function toEventRows(
  report: { rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] } | undefined,
): EventRow[] {
  return (report?.rows ?? [])
    .map((row) => ({
      eventName: row.dimensionValues?.[0]?.value ?? "",
      count: Number(row.metricValues?.[0]?.value ?? 0),
    }))
    .filter((e) => e.eventName !== "page_view");
}

export function sumByType(events: EventRow[], type: EventType): number {
  return events.filter((e) => classifyEvent(e.eventName) === type).reduce((s, e) => s + e.count, 0);
}
