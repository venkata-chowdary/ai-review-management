import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { stepHref, type StepSlug } from "@/lib/onboarding";

// Everything here finds the business from the signed-in user, never from an id
// in the request. Row level security enforces the same rule in the database.

export type Business = {
  id: string;
  name: string;
  businessType: string | null;
  onboardingStep: StepSlug | "done";
  aiTone: string | null;
  aiApprovalRule: string | null;
  aiAutoPublish: boolean;
};

/** The signed-in user and their business, or null when signed out. */
export const getOwner = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, business_type, onboarding_step, ai_tone, ai_approval_rule, ai_auto_publish")
    .eq("user_id", session.id)
    .maybeSingle();
  if (!data) return null;

  const business: Business = {
    id: data.id,
    name: data.name,
    businessType: data.business_type,
    onboardingStep: data.onboarding_step as Business["onboardingStep"],
    aiTone: data.ai_tone,
    aiApprovalRule: data.ai_approval_rule,
    aiAutoPublish: data.ai_auto_publish,
  };
  return { user: session, business };
});

/** For pages that need an owner: signed-out visitors go to sign-in. */
export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) redirect("/sign-in");
  return owner;
}

/** For the dashboard: owners who have not finished setup go back to onboarding. */
export async function requireOnboardedOwner() {
  const owner = await requireOwner();
  if (owner.business.onboardingStep !== "done") redirect("/onboarding");
  return owner;
}

const order: StepSlug[] = ["business", "branch", "google", "replies", "qr"];

/** Sends the owner back to their current step when they open one that is further ahead. */
export async function requireStepAccess(step: StepSlug) {
  const owner = await requireOwner();
  const current = owner.business.onboardingStep;
  if (current !== "done" && order.indexOf(step) > order.indexOf(current)) redirect(stepHref(current));
  return owner;
}

export function initialsOf(name: string, fallback: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return letters || fallback.slice(0, 1).toUpperCase() || "?";
}
