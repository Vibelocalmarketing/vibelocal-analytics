import { Megaphone, Globe2, MapPin, Sigma } from "lucide-react";
import { getStoredConnection, listProperties } from "@/lib/google/ga4";
import { getChecklist, applyIntegrationOrder } from "@/lib/integration/db";
import { getEntriesForProperty, getAllCallClickNotes } from "@/lib/callclicks/db";
import { addEntry } from "@/lib/callclicks/actions";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { CallClickRow } from "@/components/call-click-row";

export default async function CallClicksPage({
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

  if (!propertyId) {
    return (
      <div className="p-8">
        <p className="text-slate-500">No GA4 properties found on this account.</p>
      </div>
    );
  }

  const [entries, notesByEntry] = await Promise.all([
    getEntriesForProperty(propertyId),
    getAllCallClickNotes(),
  ]);
  const addEntryWithProperty = addEntry.bind(null, propertyId);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Call Clicks</h1>
        <p className="text-sm text-slate-500">
          Manual monthly log — check Google Ads, your website, and Google Business Profile yourself and record the numbers here.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Website</label>
          <select
            name="property"
            defaultValue={propertyId}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
        >
          Switch
        </button>
      </form>

      <form
        action={addEntryWithProperty}
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Month</label>
          <input
            type="text"
            name="month"
            placeholder="August 2026"
            required
            className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <Megaphone className="h-3.5 w-3.5" /> Google Ads Call Clicks
          </label>
          <input
            type="number"
            name="google_ads_call_clicks"
            min={0}
            defaultValue={0}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <Globe2 className="h-3.5 w-3.5" /> Website Call Clicks
          </label>
          <input
            type="number"
            name="website_call_clicks"
            min={0}
            defaultValue={0}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> GMB Call Clicks
          </label>
          <input
            type="number"
            name="gmb_call_clicks"
            min={0}
            defaultValue={0}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
        >
          Save Entry
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Month</th>
              <th className="px-3 py-3 text-center">
                <span className="flex flex-col items-center gap-1">
                  <Megaphone className="h-3.5 w-3.5 text-slate-400" />
                  Google Ads Call Clicks
                </span>
              </th>
              <th className="px-3 py-3 text-center">
                <span className="flex flex-col items-center gap-1">
                  <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                  Website Call Clicks
                </span>
              </th>
              <th className="px-3 py-3 text-center">
                <span className="flex flex-col items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  GMB Call Clicks
                </span>
              </th>
              <th className="px-3 py-3 text-center">
                <span className="flex flex-col items-center gap-1">
                  <Sigma className="h-3.5 w-3.5 text-slate-400" />
                  Total Call Clicks
                </span>
              </th>
              <th className="px-3 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  No entries logged yet for this website.
                </td>
              </tr>
            ) : (
              entries.map((e, index) => (
                <CallClickRow
                  key={e.id}
                  entry={e}
                  notes={notesByEntry.get(e.id) ?? []}
                  orderedEntryIds={entries.map((entry) => entry.id)}
                  canMoveUp={index > 0}
                  canMoveDown={index < entries.length - 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
