"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { signInWithPassword } from "@/lib/auth/actions";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Footer } from "@/components/footer";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInWithPassword, undefined);

  return (
    <div className="flex flex-1 flex-col bg-slate-950">
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <GradientBlobs />

        <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>

          <h1 className="mb-8 text-center text-2xl font-semibold text-white">
            Log in
          </h1>

          <form action={formAction} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400"
            />

            {state?.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50 disabled:opacity-50 disabled:hover:scale-100"
            >
              {pending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <div className="relative bg-slate-950">
        <Footer dark />
      </div>
    </div>
  );
}
