"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithPassword, signInWithGoogle } from "@/lib/auth/actions";
import { Footer } from "@/components/footer";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, undefined);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
            Create your account
          </h1>

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Continue with Google
            </button>
          </form>

          <div className="mb-6 flex items-center gap-3 text-xs text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200" />
            OR
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input
              name="name"
              type="text"
              placeholder="Full name"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              minLength={6}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-500"
            />

            {state?.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {pending ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
