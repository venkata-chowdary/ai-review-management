"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/data/business";
import { createBranch, listBranches, updateBranch } from "@/lib/data/branches";
import { stepHref, type StepSlug } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import {
  approvalRules,
  branchName,
  businessName,
  businessType,
  fieldErrors,
  optionalMapsUrl,
  reviewUrl,
  toneValues,
  type ActionState,
} from "@/lib/validation";

// One action per onboarding step. Each saves that step's answers for the
// signed-in owner, moves "onboarding_step" forward (never backward, so editing
// an earlier step does not undo progress) and goes to the next step.

const order: (StepSlug | "done")[] = ["business", "branch", "google", "replies", "qr", "done"];

async function save(userId: string, current: string, target: StepSlug | "done", fields: Record<string, unknown> = {}) {
  const next = order.indexOf(target) > order.indexOf(current as StepSlug | "done") ? target : current;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ ...fields, onboarding_step: next })
    .eq("user_id", userId);
  return !error;
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const failed: ActionState = { error: "We could not save this. Please try again." };

export async function saveBusiness(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const { user, business } = await requireOwner();
  const values = { name: text(formData, "name"), type: text(formData, "type") };
  const parsed = z.object({ name: businessName, type: businessType }).safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const ok = await save(user.id, business.onboardingStep, "branch", { name: parsed.data.name, business_type: parsed.data.type });
  if (!ok) return { ...failed, values };
  redirect(stepHref("branch"));
}

export async function saveBranch(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const { user, business } = await requireOwner();
  const values = { name: text(formData, "name"), url: text(formData, "url"), reviewUrl: text(formData, "reviewUrl") };
  const parsed = z.object({ name: branchName, url: optionalMapsUrl, reviewUrl }).safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  // Going back to this step edits the first branch instead of adding another.
  const [first] = await listBranches();
  const input = { name: parsed.data.name, googleMapsUrl: parsed.data.url || null, googleReviewUrl: parsed.data.reviewUrl };
  const result = first ? await updateBranch(first.id, input) : await createBranch(input);
  if (!result.ok) return { error: result.error, values };

  if (!(await save(user.id, business.onboardingStep, "google"))) return { ...failed, values };
  redirect(stepHref("google"));
}

// Google is not connected in this phase, so this step only moves on.
export async function skipGoogle(): Promise<void> {
  const { user, business } = await requireOwner();
  if (!(await save(user.id, business.onboardingStep, "replies"))) redirect(stepHref("google"));
  redirect(stepHref("replies"));
}

export async function saveReplies(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const { user, business } = await requireOwner();
  const parsed = z
    .object({ tone: z.enum(toneValues), rule: z.enum(approvalRules), auto: z.enum(["true", "false"]) })
    .safeParse({ tone: text(formData, "tone"), rule: text(formData, "rule"), auto: text(formData, "auto") });
  if (!parsed.success) return { error: "Please choose how replies should sound and who checks them." };

  // Auto-posting needs a Google connection, which comes in a later phase, so
  // it is always saved as off for now.
  const ok = await save(user.id, business.onboardingStep, "qr", {
    ai_tone: parsed.data.tone,
    ai_approval_rule: parsed.data.rule,
    ai_auto_publish: false,
  });
  if (!ok) return failed;
  redirect(stepHref("qr"));
}

export async function finishOnboarding(): Promise<void> {
  const { user, business } = await requireOwner();
  if (!(await save(user.id, business.onboardingStep, "done"))) redirect(stepHref("qr"));
  redirect("/");
}
