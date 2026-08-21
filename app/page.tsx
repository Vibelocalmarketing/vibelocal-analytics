import Link from "next/link";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          VibeLocal Analytics
        </h1>
        <p className="max-w-md text-lg text-zinc-600">
          Local business analytics, made simple.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Log in
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
