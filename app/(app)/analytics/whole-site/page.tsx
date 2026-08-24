import { Users, MousePointerClick, Phone, CheckCircle2, Eye, UserPlus, ShoppingCart, Megaphone } from "lucide-react";
import { getStoredConnection, listProperties, runReport } from "@/lib/google/ga4";
import { getChecklist, applyIntegrationOrder } from "@/lib/integration/db";
import {
  comparisonRange,
  defaultRangeFor,
  formatRangeLabel,
  type CompareMode,
} from "@/lib/analytics/period";
import { sumByType, sumEventName, toEventRows } from "@/lib/analytics/events";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { StatCard } from "@/components/stat-card";
import { DateRangePresets } from "@/components/date-range-presets";
import { TrackingAlertIcon } from "@/components/tracking-alert-icon";

function sumMetrics(report: { rows?: { metricValues?: { value: string }[] }[] } | undefined) {
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

function sumSingleMetric(report: { rows?: { metricValues?: { value: string }[] }[] } | undefined): number {
  let total = 0;
  for (const row of report?.rows ?? []) {
    total += Number(row.metricValues?.[0]?.value ?? 0);
  }
  return total;
}

// Matches GA4's auto-tagging for actual Google Ads clicks (source=google,
// medium=cpc) — distinct from organic Google search (medium=organic).
const googleAdsFilter = {
  andGroup: {
    expressions: [
      { filter: { fieldName: "sessionSource", stringFilter: { matchType: "EXACT", value: "google" } } },
      { filter: { fieldName: "sessionMedium", stringFilter: { matchType: "EXACT", value: "cpc" } } },
    ],
  },
};

function deltaPct(current: number, previous: number): number | null {
  // Previous period had nothing to divide by. If the current period also has
  // nothing, there's no real change to report. If it has something now, that's
  // a genuine increase from zero — Infinity is a sentinel StatCard renders as "New".
  if (previous === 0) return current > 0 ? Infinity : null;
  return ((current - previous) / previous) * 100;
}

function statProps(current: number, compare: number | null, compareRangeLabel?: string) {
  return {
    deltaPct: compare !== null ? deltaPct(current, compare) : undefined,
    compareValue: compare !== null ? compare.toLocaleString() : undefined,
    compareRangeLabel,
  };
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

  const [allProperties, checklist] = await Promise.all([listProperties(), getChecklist()]);
  const properties = applyIntegrationOrder(allProperties, checklist);
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
    metrics: ["activeUsers", "sessions", "screenPageViews"],
  });

  const currentEventsReport = await runReport({
    propertyId,
    startDate: start,
    endDate: end,
    dimensions: ["eventName"],
    metrics: ["eventCount"],
  });

  const googleAdsReport = await runReport({
    propertyId,
    startDate: start,
    endDate: end,
    dimensions: [],
    metrics: ["sessions"],
    dimensionFilter: googleAdsFilter,
  });

  const compareRange = comparisonRange(start, end, compareMode);
  const compareReport = compareRange
    ? await runReport({
        propertyId,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: [],
        metrics: ["activeUsers", "sessions", "screenPageViews"],
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

  const compareGoogleAdsReport = compareRange
    ? await runReport({
        propertyId,
        startDate: compareRange.start,
        endDate: compareRange.end,
        dimensions: [],
        metrics: ["sessions"],
        dimensionFilter: googleAdsFilter,
      })
    : null;

  const currentTotals = sumMetrics(currentReport);
  const compareTotals = compareReport ? sumMetrics(compareReport) : null;
  const compareRangeLabel = compareRange ? formatRangeLabel(compareRange.start, compareRange.end) : undefined;

  const googleAdsVisits = sumSingleMetric(googleAdsReport);
  const compareGoogleAdsVisits = compareGoogleAdsReport ? sumSingleMetric(compareGoogleAdsReport) : null;

  const currentEvents = toEventRows(currentEventsReport);
  const phoneClicks = sumByType(currentEvents, "phone");
  const formSubmits = sumByType(currentEvents, "form_submit");
  const addToCarts = sumEventName(currentEvents, "add_to_cart");
  const firstVisits = sumEventName(currentEvents, "first_visit");

  const compareEvents = compareEventsReport ? toEventRows(compareEventsReport) : null;
  const comparePhoneClicks = compareEvents ? sumByType(compareEvents, "phone") : null;
  const compareFormSubmits = compareEvents ? sumByType(compareEvents, "form_submit") : null;
  const compareAddToCarts = compareEvents ? sumEventName(compareEvents, "add_to_cart") : null;
  const compareFirstVisits = compareEvents ? sumEventName(compareEvents, "first_visit") : null;

  const alerts: string[] = [];
  if (currentTotals.sessions === 0) {
    alerts.push(
      "No traffic recorded at all in this date range. If that seems wrong, double-check that Google Analytics is still installed and firing on this site.",
    );
  } else if (phoneClicks === 0 && formSubmits === 0) {
    alerts.push(
      "No phone clicks or form submissions recorded in this range, even though there's traffic. If this site has a phone number or contact form, it's worth checking that click/submit tracking is still wired up correctly.",
    );
  } else {
    if (phoneClicks === 0) {
      alerts.push(
        "No phone clicks recorded in this range. If this site has a clickable phone number, check that its click tracking is still firing.",
      );
    }
    if (formSubmits === 0) {
      alerts.push(
        "No form submissions recorded in this range. If this site has a lead form, check that its submit tracking is still firing.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Site-Wide Analytics</h1>
          <TrackingAlertIcon messages={alerts} />
        </div>
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
            key={start}
            type="date"
            name="start"
            defaultValue={start}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            key={end}
            type="date"
            name="end"
            defaultValue={end}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Compare to</label>
          <select
            name="compare"
            defaultValue={compareMode}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
        <StatCard
          label="Google Ads Clicks"
          value={googleAdsVisits.toLocaleString()}
          icon={Megaphone}
          {...statProps(googleAdsVisits, compareGoogleAdsVisits, compareRangeLabel)}
        />
      </div>
    </div>
  );
}
