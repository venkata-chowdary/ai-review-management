import type { Metadata } from "next";
import { RepliesStep } from "@/components/onboarding/Steps";
import { StepGate } from "@/components/onboarding/StepGate";

export const metadata: Metadata = { title: "Set up · AI replies" };

export default function RepliesStepPage() {
  return (
    <StepGate step="replies">
      <RepliesStep />
    </StepGate>
  );
}
