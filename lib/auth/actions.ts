"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error: string } | undefined;

export async function signUpWithPassword(
  _prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase returns a fake success (a user object with no identities, no error)
  // when the email is already registered. Absence of `error` is not enough here.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Try logging in instead.",
    };
  }

  redirect("/dashboard");
}

export async function signInWithPassword(
  _prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=google-auth-failed");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
