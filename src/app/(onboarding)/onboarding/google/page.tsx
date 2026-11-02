import type { Metadata } from "next";
import { GoogleStep } from "@/components/onboarding/Steps";
import { StepGate } from "@/components/onboarding/StepGate";

export const metadata: Metadata = { title: "Set up · Connect Google" };

export default function GoogleStepPage() {
  return (
    <StepGate step="google">
      <GoogleStep />
    </StepGate>
  );
}
