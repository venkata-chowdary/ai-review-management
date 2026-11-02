"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import type { OnboardingDraft } from "@/lib/onboarding";

// The saved answers for the signed-in owner, loaded on the server by StepGate
// and handed to the step components.
const DraftContext = createContext<OnboardingDraft>({});

export function OnboardingDraftProvider({ draft, children }: { draft: OnboardingDraft; children: ReactNode }) {
  return createElement(DraftContext.Provider, { value: draft }, children);
}

export function useOnboardingDraft() {
  return useContext(DraftContext);
}
