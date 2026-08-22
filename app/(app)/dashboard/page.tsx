import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome back
      </h1>
      <p className="text-slate-500">{user?.email}</p>
    </div>
  );
}
