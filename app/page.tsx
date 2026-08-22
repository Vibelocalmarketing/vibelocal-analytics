import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950">
      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 text-center">
        <GradientBlobs />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/40">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>

        <h1 className="relative max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            VibeLocal Analytics
          </span>
        </h1>
        <p className="relative max-w-md text-lg text-slate-400">
          Local business analytics, made simple.
        </p>
        <div className="relative flex gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105 hover:shadow-indigo-500/50"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </main>
      <div className="relative bg-slate-950">
        <Footer dark />
      </div>
    </div>
  );
}
