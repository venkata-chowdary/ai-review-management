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
    branch: branch
      ? {
          id: branch.id,
          name: branch.name,
          googleMapsUrl: branch.googleMapsUrl ?? "",
          googleReviewUrl: branch.googleReviewUrl ?? "",
          qrCode: branch.qrCode,
        }
      : undefined,
    googleConnected: false,
    tone: (business.aiTone as OnboardingDraft["tone"]) ?? undefined,
    approvalRule: (business.aiApprovalRule as OnboardingDraft["approvalRule"]) ?? undefined,
    autoPublish: business.aiAutoPublish,
  };
  return <OnboardingDraftProvider draft={draft}>{children}</OnboardingDraftProvider>;
}

// Reads cookies, so it sits behind its own Suspense boundary.
export function StepGate({ step, children }: { step: StepSlug; children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate step={step}>{children}</Gate>
    </Suspense>
  );
}
