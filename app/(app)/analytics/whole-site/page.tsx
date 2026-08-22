import { Users, MousePointerClick, Phone, CheckCircle2 } from "lucide-react";
import { getStoredConnection, listProperties, runReport } from "@/lib/google/ga4";
import {
  comparisonRange,
  defaultRangeFor,
  formatRangeLabel,
  type CompareMode,
} from "@/lib/analytics/period";
import { sumByType, toEventRows } from "@/lib/analytics/events";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { StatCard } from "@/components/stat-card";
import { DateRangePresets } from "@/components/date-range-presets";

function sumMetrics(report: { rows?: { metricValues?: { value: string }[] }[] } | undefined) {
  let users = 0;
  let sessions = 0;
  for (const row of report?.rows ?? []) {
    users += Number(row.metricValues?.[0]?.value ?? 0);
    sessions += Number(row.metricValues?.[1]?.value ?? 0);
  }
  return { users, sessions };
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export default async function WholeSiteAnalyticsPage({
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
  const compareMode = (params.compare as CompareMode) || "none";

  if (!propertyId) {
    return (
      <div className="p-8">
        <p className="text-slate-500">
          Connected as {connection.google_email}, but no GA4 properties were found on that account.
        </p>
      </div>
    );
  }

  const currentReport = await runReport({
    propertyId,
    startDate: start,
    endDate: end,
    dimensions: [],
    metrics: ["activeUsers", "sessions"],
  });

  const currentEventsReport = await runReport({
    propertyId,
    startDate: start,
    endDate: end,
    dimensions: ["eventName"],
    metrics: ["eventCount"],
  });

  const compareRange = comparisonRange(start, end, compareMode);
  const compareReport = compareRange
    ? await runReport({
        propertyId,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: [],
        metrics: ["activeUsers", "sessions"],
      })
    : null;

  const compareEventsReport = compareRange
    ? await runReport({
        propertyId,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: ["eventName"],
        metrics: ["eventCount"],
      })
    : null;

  const currentTotals = sumMetrics(currentReport);
  const compareTotals = compareReport ? sumMetrics(compareReport) : null;
  const compareRangeLabel = compareRange ? formatRangeLabel(compareRange.start, compareRange.end) : undefined;

  const currentEvents = toEventRows(currentEventsReport);
  const phoneClicks = sumByType(currentEvents, "phone");
  const formSubmits = sumByType(currentEvents, "form_submit");

  const compareEvents = compareEventsReport ? toEventRows(compareEventsReport) : null;
  const comparePhoneClicks = compareEvents ? sumByType(compareEvents, "phone") : null;
  const compareFormSubmits = compareEvents ? sumByType(compareEvents, "form_submit") : null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Whole Site Analytics</h1>
        <p className="text-sm text-slate-500">
          Connected as {connection.google_email}
        </p>
      </div>

      <DateRangePresets pathname="/analytics/whole-site" currentParams={params} />

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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Compare to</label>
          <select
            name="compare"
            defaultValue={compareMode}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="none">No comparison</option>
            <option value="previous">Previous period (same length)</option>
            <option value="yoy">Same period last year</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
        >
          Update
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Users"
          value={currentTotals.users.toLocaleString()}
          icon={Users}
          deltaPct={compareTotals ? deltaPct(currentTotals.users, compareTotals.users) : undefined}
          compareValue={compareTotals ? compareTotals.users.toLocaleString() : undefined}
          compareRangeLabel={compareRangeLabel}
        />
        <StatCard
          label="Sessions"
          value={currentTotals.sessions.toLocaleString()}
          icon={MousePointerClick}
          deltaPct={
            compareTotals ? deltaPct(currentTotals.sessions, compareTotals.sessions) : undefined
          }
          compareValue={compareTotals ? compareTotals.sessions.toLocaleString() : undefined}
          compareRangeLabel={compareRangeLabel}
        />
        <StatCard
          label="Phone Clicks"
          value={phoneClicks.toLocaleString()}
          icon={Phone}
          deltaPct={
            comparePhoneClicks !== null ? deltaPct(phoneClicks, comparePhoneClicks) : undefined
          }
          compareValue={comparePhoneClicks !== null ? comparePhoneClicks.toLocaleString() : undefined}
          compareRangeLabel={compareRangeLabel}
        />
        <StatCard
          label="Form Submissions"
          value={formSubmits.toLocaleString()}
          icon={CheckCircle2}
          deltaPct={
            compareFormSubmits !== null ? deltaPct(formSubmits, compareFormSubmits) : undefined
          }
          compareValue={compareFormSubmits !== null ? compareFormSubmits.toLocaleString() : undefined}
          compareRangeLabel={compareRangeLabel}
        />
      </div>
    </div>
  );
}
