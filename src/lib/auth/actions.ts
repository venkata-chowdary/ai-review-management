"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { email, fieldErrors, newPassword, type ActionState } from "@/lib/validation";

// Messages are deliberately generic so they never reveal whether an email already has an account.

async function siteUrl() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function signIn(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email, password: z.string().min(1, "Please enter your password.") }).safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: { email: text(formData, "email") } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const unconfirmed = error.code === "email_not_confirmed";
    return {
      error: unconfirmed ? "Please confirm your email first. Check your inbox for the link." : "Wrong email or password. Please try again.",
      values: { email: parsed.data.email },
    };
  }
  redirect("/");
}

export async function signUp(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email, password: newPassword }).safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: { email: text(formData, "email") } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await siteUrl()}/auth/callback?next=/onboarding` },
  });
  if (error) {
    if (error.code === "weak_password") return { fieldErrors: { password: "Please choose a stronger password." }, values: { email: parsed.data.email } };
    return { error: "We could not create your account. Please try again.", values: { email: parsed.data.email } };
  }
  // With email confirmation off (local development) there is a session straight away.
  if (data.session) redirect("/onboarding");
  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signInWithGoogle(next: string = "/"): Promise<ActionState> {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });
  if (error || !data.url) return { error: "Google sign-in is not available right now. Please use your email." };
  redirect(data.url);
}

export async function forgotPassword(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = email.safeParse(text(formData, "email"));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message }, values: { email: text(formData, "email") } };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });
  // Same answer whether or not the account exists.
  return { ok: true, values: { email: parsed.data } };
}

export async function resetPassword(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const password = text(formData, "password");
  const checked = newPassword.safeParse(password);
  const errors: Record<string, string> = {};
  if (!checked.success) errors.password = checked.error.issues[0].message;
  if (text(formData, "confirm") !== password) errors.confirm = "Both passwords should be the same.";
  if (Object.keys(errors).length) return { fieldErrors: errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Please choose a password you have not used before." } };
    return { error: "This reset link has expired. Please ask for a new one." };
  }
  return { ok: true };
}

export async function resendConfirmation(address: string): Promise<ActionState> {
  const parsed = email.safeParse(address);
  if (!parsed.success) return { error: "This email doesn’t look right." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await siteUrl()}/auth/callback?next=/onboarding` },
  });
  if (error) return { error: "We could not send it again. Please wait a moment and try again." };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
