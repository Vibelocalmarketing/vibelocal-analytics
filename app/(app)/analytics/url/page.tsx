import { Eye, MousePointerClick, Phone, FileText, CheckCircle2 } from "lucide-react";
import { getStoredConnection, listProperties, runReport } from "@/lib/google/ga4";
import { defaultRangeFor } from "@/lib/analytics/period";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { StatCard } from "@/components/stat-card";

type EventRow = { eventName: string; count: number };

function classify(eventName: string): "phone" | "form_start" | "form_submit" | "other" {
  const n = eventName.toLowerCase();
  if (n.includes("phone") || n.includes("call")) return "phone";
  if (n.includes("form") && n.includes("start")) return "form_start";
  if (n.includes("form") && (n.includes("submit") || n.includes("complete"))) return "form_submit";
  return "other";
}

export default async function UrlAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const connection = await getStoredConnection();

  if (!connection) {
    return (
      <div className="p-8">
        <Ga4ConnectBanner />
      </div>
    );
  }

  const properties = await listProperties();
  const params = await searchParams;
  const propertyId = params.property || properties[0]?.propertyId;
  const defaults = defaultRangeFor("day");
  const start = params.start || defaults.start;
  const end = params.end || defaults.end;
  const path = params.path || "";

  const hasQuery = Boolean(propertyId && path);

  let pageViews = 0;
  let sessions = 0;
  let events: EventRow[] = [];

  if (hasQuery) {
    const pathFilter = {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "CONTAINS", value: path },
      },
    };

    const trafficReport = await runReport({
      propertyId: propertyId!,
      startDate: start,
      endDate: end,
      dimensions: ["pagePath"],
      metrics: ["screenPageViews", "sessions"],
      dimensionFilter: pathFilter,
    });

    for (const row of trafficReport.rows ?? []) {
      pageViews += Number(row.metricValues?.[0]?.value ?? 0);
      sessions += Number(row.metricValues?.[1]?.value ?? 0);
    }

    const eventsReport = await runReport({
      propertyId: propertyId!,
      startDate: start,
      endDate: end,
      dimensions: ["eventName"],
      metrics: ["eventCount"],
      dimensionFilter: pathFilter,
    });

    events = (eventsReport.rows ?? [])
      .map((row: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }) => ({
        eventName: row.dimensionValues?.[0]?.value ?? "",
        count: Number(row.metricValues?.[0]?.value ?? 0),
      }))
      .filter((e: EventRow) => e.eventName !== "page_view")
      .sort((a: EventRow, b: EventRow) => b.count - a.count);
  }

  const phoneClicks = events.filter((e) => classify(e.eventName) === "phone").reduce((s, e) => s + e.count, 0);
  const formStarts = events.filter((e) => classify(e.eventName) === "form_start").reduce((s, e) => s + e.count, 0);
  const formSubmits = events.filter((e) => classify(e.eventName) === "form_submit").reduce((s, e) => s + e.count, 0);
  const buttonClicks = events.filter((e) => classify(e.eventName) === "other");

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">URL Analytics</h1>
        <p className="text-sm text-slate-500">Connected as {connection.google_email}</p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Property</label>
          <select
            name="property"
            defaultValue={propertyId}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.displayName} ({p.accountName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Page path or URL</label>
          <input
            type="text"
            name="path"
            placeholder="/free-estimate"
            defaultValue={path}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            name="start"
            defaultValue={start}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            name="end"
            defaultValue={end}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
        >
          Analyze
        </button>
      </form>

      {!hasQuery ? (
        <p className="text-sm text-slate-400">Enter a page path above to see its analytics.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Page Views" value={pageViews.toLocaleString()} icon={Eye} />
            <StatCard label="Sessions" value={sessions.toLocaleString()} icon={MousePointerClick} />
            <StatCard label="Phone Clicks" value={phoneClicks.toLocaleString()} icon={Phone} />
            <StatCard label="Form Starts" value={formStarts.toLocaleString()} icon={FileText} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Form Submissions" value={formSubmits.toLocaleString()} icon={CheckCircle2} />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Button clicks &amp; other events</h2>
              <p className="text-xs text-slate-400">
                Every other event fired on this page, by name — including named button clicks, if your
                site&apos;s GA4 setup tracks them.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Event name</th>
                  <th className="px-5 py-3">Count</th>
                </tr>
              </thead>
              <tbody>
                {buttonClicks.map((e) => (
                  <tr key={e.eventName} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 text-slate-700">{e.eventName}</td>
                    <td className="px-5 py-3 text-slate-700">{e.count.toLocaleString()}</td>
                  </tr>
                ))}
                {buttonClicks.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-slate-400">
                      No other events tracked on this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
