import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/data/business";
import { stepHref } from "@/lib/onboarding";

// /onboarding resumes at the first unfinished step.
async function Resume(): Promise<never> {
  const { business } = await requireOwner();
  redirect(business.onboardingStep === "done" ? "/" : stepHref(business.onboardingStep));
}

export default function OnboardingStart() {
  return (
    <Suspense fallback={null}>
      <Resume />
    </Suspense>
  );
}
