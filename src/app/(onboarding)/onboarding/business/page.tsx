import type { Metadata } from "next";
import { BusinessStep } from "@/components/onboarding/Steps";
import { StepGate } from "@/components/onboarding/StepGate";

export const metadata: Metadata = { title: "Set up · Your business" };

export default function BusinessStepPage() {
  return (
    <StepGate step="business">
      <BusinessStep />
    </StepGate>
  );
}
