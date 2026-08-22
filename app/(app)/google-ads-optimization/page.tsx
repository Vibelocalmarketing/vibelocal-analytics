import { Target } from "lucide-react";

export default function GoogleAdsOptimizationPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
        <Target className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Google Ads Optimization</h1>
      <p className="max-w-sm text-sm text-slate-500">Coming soon.</p>
    </div>
  );
}
