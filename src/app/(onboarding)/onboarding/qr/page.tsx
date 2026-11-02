import type { Metadata } from "next";
import { QrStep } from "@/components/onboarding/Steps";
import { StepGate } from "@/components/onboarding/StepGate";

export const metadata: Metadata = { title: "Set up · Your QR code" };

export default function QrStepPage() {
  return (
    <StepGate step="qr">
      <QrStep />
    </StepGate>
  );
}
