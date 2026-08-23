import {
  Users,
  MousePointerClick,
  Eye,
  UserPlus,
  Phone,
  CheckCircle2,
  ShoppingCart,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { getStoredConnection, listProperties } from "@/lib/google/ga4";
import {
  getChecklist,
  getAllNotes,
  orderPropertyIds,
  CHECKLIST_COLUMNS,
  type ChecklistColumn,
} from "@/lib/integration/db";
import { saveChecklist } from "@/lib/integration/actions";
import { Ga4ConnectBanner } from "@/components/ga4-connect-banner";
import { IntegrationNotesPopover } from "@/components/integration-notes-popover";
import { IntegrationRowControls } from "@/components/integration-row-controls";

const COLUMN_META: Record<ChecklistColumn, { label: string; icon: typeof Users }> = {
  users: { label: "Users", icon: Users },
  sessions: { label: "Sessions", icon: MousePointerClick },
  page_views: { label: "Page Views", icon: Eye },
  first_visits: { label: "First Visits", icon: UserPlus },
  phone_clicks: { label: "Phone Clicks", icon: Phone },
  form_submissions: { label: "Form Submissions", icon: CheckCircle2 },
  add_to_cart: { label: "Add to Cart", icon: ShoppingCart },
  google_ads_clicks: { label: "Google Ads Clicks", icon: Megaphone },
};

export default async function IntegrationStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ showHidden?: string }>;
}) {
  const connection = await getStoredConnection();

  if (!connection) {
    return (
      <div className="p-8">
        <Ga4ConnectBanner />
      </div>
    );
  }

  const { showHidden } = await searchParams;

  const [allProperties, checklist, notesByProperty] = await Promise.all([
    listProperties(),
    getChecklist(),
    getAllNotes(),
  ]);

  const allPropertyIds = allProperties.map((p) => p.propertyId);
  const orderedIds = orderPropertyIds(allPropertyIds, checklist);
  const byId = new Map(allProperties.map((p) => [p.propertyId, p]));

  const orderedProperties = orderedIds.map((id) => byId.get(id)!);
  const hiddenCount = orderedProperties.filter((p) => checklist.get(p.propertyId)?.hidden).length;
  const properties = showHidden
    ? orderedProperties
    : orderedProperties.filter((p) => !checklist.get(p.propertyId)?.hidden);

  const saveWithIds = saveChecklist.bind(null, allPropertyIds);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Integration Status</h1>
        <p className="text-sm text-slate-500">
          Manual checklist — tick off each metric once you've personally confirmed it's tracking correctly for that site.
        </p>
        {hiddenCount > 0 && (
          <Link
            href={showHidden ? "/integration-status" : "/integration-status?showHidden=1"}
            className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showHidden ? "Hide inactive sites" : `Show ${hiddenCount} hidden site${hiddenCount === 1 ? "" : "s"}`}
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-slate-500">No GA4 properties found on this account.</p>
      ) : (
        <form action={saveWithIds} className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                  <th className="sticky left-0 z-10 bg-white px-4 py-3">Website</th>
                  {CHECKLIST_COLUMNS.map((column) => {
                    const { label, icon: Icon } = COLUMN_META[column];
                    return (
                      <th key={column} className="px-3 py-3 text-center">
                        <span className="flex flex-col items-center gap-1">
                          <Icon className="h-3.5 w-3.5 text-slate-400" />
                          {label}
                        </span>
                      </th>
                    );
                  })}
                  <th className="px-3 py-3 text-center">Notes</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, index) => {
                  const row = checklist.get(p.propertyId);
                  const notes = notesByProperty.get(p.propertyId) ?? [];
                  const visibleIds = properties.map((pp) => pp.propertyId);
                  return (
                    <tr key={p.propertyId} className="border-b border-slate-100 last:border-0">
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <IntegrationRowControls
                            propertyId={p.propertyId}
                            hidden={row?.hidden ?? false}
                            orderedPropertyIds={visibleIds}
                            canMoveUp={index > 0}
                            canMoveDown={index < properties.length - 1}
                          />
                          <span>
                            {p.displayName} <span className="text-slate-400">({p.accountName})</span>
                          </span>
                        </div>
                      </td>
                      {CHECKLIST_COLUMNS.map((column) => (
                        <td key={column} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            name={`${p.propertyId}__${column}`}
                            defaultChecked={row?.[column] ?? false}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center">
                        <IntegrationNotesPopover propertyId={p.propertyId} notes={notes} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="self-start rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
