"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Link2,
  Target,
  LogOut,
  Sparkles,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

const analyticsLinks = [
  { href: "/analytics/whole-site", label: "Site-Wide Analytics", icon: Globe },
  { href: "/analytics/url", label: "Single Page Analytics", icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? "bg-gradient-to-r from-indigo-500/15 to-fuchsia-500/15 text-white shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-950">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">
          VibeLocal Analytics
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <Link href="/dashboard" className={linkClass(pathname === "/dashboard")}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="pt-5">
          <div className="flex items-center gap-1.5 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </div>
          <div className="space-y-1">
            {analyticsLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-5">
          <Link
            href="/google-ads-optimization"
            className={linkClass(pathname === "/google-ads-optimization")}
          >
            <Target className="h-4 w-4" />
            Google Ads Optimization
          </Link>
        </div>
      </nav>

      <form action={signOut} className="border-t border-white/5 px-3 py-4">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
