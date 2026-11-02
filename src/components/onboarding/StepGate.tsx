import { Suspense, type ReactNode } from "react";
import { listBranches } from "@/lib/data/branches";
import { requireStepAccess } from "@/lib/data/business";
import type { OnboardingDraft, StepSlug } from "@/lib/onboarding";
import { OnboardingDraftProvider } from "./useOnboardingDraft";

async function Gate({ step, children }: { step: StepSlug; children: ReactNode }) {
  const { business } = await requireStepAccess(step);
  const [branch] = await listBranches();

  const draft: OnboardingDraft = {
    businessName: business.name || undefined,
    businessType: business.businessType ?? undefined,
    branch: branch ? { name: branch.name, googleMapsUrl: branch.googleMapsUrl ?? "" } : undefined,
    googleConnected: false,
    tone: (business.aiTone as OnboardingDraft["tone"]) ?? undefined,
    approvalRule: (business.aiApprovalRule as OnboardingDraft["approvalRule"]) ?? undefined,
    autoPublish: business.aiAutoPublish,
  };
  return <OnboardingDraftProvider draft={draft}>{children}</OnboardingDraftProvider>;
}

/**
 * Wraps a step page: requires a signed-in owner, sends them back to their
 * current step if they opened one that is further ahead, and provides the saved
 * answers. Reads cookies, so it sits behind its own Suspense boundary.
 */
export function StepGate({ step, children }: { step: StepSlug; children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate step={step}>{children}</Gate>
    </Suspense>
  );
}
