import type { Tone } from "@/lib/mock/types";

// Onboarding steps, in order. Each step is its own route under /onboarding.
export const onboardingSteps = [
  { slug: "business", label: "Your business", hint: "Name and type" },
  { slug: "branch", label: "First branch", hint: "Name and Maps link" },
  { slug: "google", label: "Connect Google", hint: "Optional" },
  { slug: "replies", label: "AI replies", hint: "Style and approval" },
  { slug: "qr", label: "Your QR code", hint: "Ready to print" },
] as const;

export type StepSlug = (typeof onboardingSteps)[number]["slug"];

export function stepHref(slug: StepSlug) {
  return `/onboarding/${slug}`;
}

/** Answers carried between steps. Provisional: kept in sessionStorage, not saved to the database. */
export type OnboardingDraft = {
  businessName?: string;
  businessType?: string;
  branch?: { name: string; googleMapsUrl: string };
  googleConnected?: boolean;
  tone?: Tone;
  approvalRule?: "2" | "3" | "all";
  autoPublish?: boolean;
};

/** Google Maps share links: maps.app.goo.gl, goo.gl/maps, g.page and google.com/maps. */
export function isGoogleMapsUrl(value: string) {
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "");
    return (
      host === "maps.app.goo.gl" ||
      host === "g.page" ||
      host === "maps.google.com" ||
      (host === "goo.gl" && u.pathname.startsWith("/maps")) ||
      (/^google\.[a-z.]+$/.test(host) && u.pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
}
