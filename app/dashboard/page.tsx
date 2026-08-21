import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">
        You&apos;re logged in
      </h1>
      <p className="text-zinc-600">{user.email}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="mt-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
