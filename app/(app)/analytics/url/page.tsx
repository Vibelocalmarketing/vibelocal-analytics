import {
  Users,
  MousePointerClick,
  Eye,
  UserPlus,
  Phone,
  FileText,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { getStoredConnection, listProperties, runReport } from "@/lib/google/ga4";
import { comparisonRange, defaultRangeFor, formatRangeLabel, type CompareMode } from "@/lib/analytics/period";
import { sumByType, sumEventName, toEventRows, type EventRow } from "@/lib/analytics/events";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { StatCard } from "@/components/stat-card";
import { DateRangePresets } from "@/components/date-range-presets";

function sumTraffic(report: { rows?: { metricValues?: { value: string }[] }[] } | undefined) {
  let users = 0;
  let sessions = 0;
  let pageViews = 0;
  for (const row of report?.rows ?? []) {
    users += Number(row.metricValues?.[0]?.value ?? 0);
    sessions += Number(row.metricValues?.[1]?.value ?? 0);
    pageViews += Number(row.metricValues?.[2]?.value ?? 0);
  }
  return { users, sessions, pageViews };
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function statProps(current: number, compare: number | null, compareRangeLabel?: string) {
  return {
    deltaPct: compare !== null ? deltaPct(current, compare) : undefined,
    compareValue: compare !== null ? compare.toLocaleString() : undefined,
    compareRangeLabel,
  };
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
  const compareMode = (params.compare as CompareMode) || "none";

  const hasQuery = Boolean(propertyId && path);

  let currentTotals = { users: 0, sessions: 0, pageViews: 0 };
  let compareTotals: { users: number; sessions: number; pageViews: number } | null = null;
  let events: EventRow[] = [];
  let compareEvents: EventRow[] | null = null;
  let compareRangeLabel: string | undefined;

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
      dimensions: [],
      metrics: ["activeUsers", "sessions", "screenPageViews"],
      dimensionFilter: pathFilter,
    });

    const eventsReport = await runReport({
      propertyId: propertyId!,
      startDate: start,
      endDate: end,
      dimensions: ["eventName"],
      metrics: ["eventCount"],
      dimensionFilter: pathFilter,
    });

    currentTotals = sumTraffic(trafficReport);
    events = toEventRows(eventsReport).sort((a, b) => b.count - a.count);

    const compareRange = comparisonRange(start, end, compareMode);
    if (compareRange) {
      compareRangeLabel = formatRangeLabel(compareRange.start, compareRange.end);

      const compareTrafficReport = await runReport({
        propertyId: propertyId!,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: [],
        metrics: ["activeUsers", "sessions", "screenPageViews"],
        dimensionFilter: pathFilter,
      });

      const compareEventsReport = await runReport({
        propertyId: propertyId!,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: ["eventName"],
        metrics: ["eventCount"],
        dimensionFilter: pathFilter,
      });

      compareTotals = sumTraffic(compareTrafficReport);
      compareEvents = toEventRows(compareEventsReport);
    }
  }

  const phoneClicks = sumByType(events, "phone");
  const formStarts = sumByType(events, "form_start");
  const formSubmits = sumByType(events, "form_submit");
  const addToCarts = sumEventName(events, "add_to_cart");
  const firstVisits = sumEventName(events, "first_visit");

  const comparePhoneClicks = compareEvents ? sumByType(compareEvents, "phone") : null;
  const compareFormStarts = compareEvents ? sumByType(compareEvents, "form_start") : null;
  const compareFormSubmits = compareEvents ? sumByType(compareEvents, "form_submit") : null;
  const compareAddToCarts = compareEvents ? sumEventName(compareEvents, "add_to_cart") : null;
  const compareFirstVisits = compareEvents ? sumEventName(compareEvents, "first_visit") : null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">URL Analytics</h1>
        <p className="text-sm text-slate-500">Connected as {connection.google_email}</p>
      </div>

      <DateRangePresets pathname="/analytics/url" currentParams={params} />

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
          Analyze
        </button>
      </form>

      {!hasQuery ? (
        <p className="text-sm text-slate-400">Enter a page path above to see its analytics.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Users"
              value={currentTotals.users.toLocaleString()}
              icon={Users}
              {...statProps(currentTotals.users, compareTotals?.users ?? null, compareRangeLabel)}
            />
            <StatCard
              label="Sessions"
              value={currentTotals.sessions.toLocaleString()}
              icon={MousePointerClick}
              {...statProps(currentTotals.sessions, compareTotals?.sessions ?? null, compareRangeLabel)}
            />
            <StatCard
              label="Page Views"
              value={currentTotals.pageViews.toLocaleString()}
              icon={Eye}
              {...statProps(currentTotals.pageViews, compareTotals?.pageViews ?? null, compareRangeLabel)}
            />
            <StatCard
              label="First Visits"
              value={firstVisits.toLocaleString()}
              icon={UserPlus}
              {...statProps(firstVisits, compareFirstVisits, compareRangeLabel)}
            />
            <StatCard
              label="Phone Clicks"
              value={phoneClicks.toLocaleString()}
              icon={Phone}
              {...statProps(phoneClicks, comparePhoneClicks, compareRangeLabel)}
            />
            <StatCard
              label="Form Starts"
              value={formStarts.toLocaleString()}
              icon={FileText}
              {...statProps(formStarts, compareFormStarts, compareRangeLabel)}
            />
            <StatCard
              label="Form Submissions"
              value={formSubmits.toLocaleString()}
              icon={CheckCircle2}
              {...statProps(formSubmits, compareFormSubmits, compareRangeLabel)}
            />
            <StatCard
              label="Add to Cart"
              value={addToCarts.toLocaleString()}
              icon={ShoppingCart}
              {...statProps(addToCarts, compareAddToCarts, compareRangeLabel)}
            />
          </div>
        </>
      )}
    </div>
  );
}
