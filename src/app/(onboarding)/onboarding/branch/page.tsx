import type { Metadata } from "next";
import { BranchStep } from "@/components/onboarding/Steps";
import { StepGate } from "@/components/onboarding/StepGate";

export const metadata: Metadata = { title: "Set up · First branch" };

export default function BranchStepPage() {
  return (
    <StepGate step="branch">
      <BranchStep />
    </StepGate>
  );
}
