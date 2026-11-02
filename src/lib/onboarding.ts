import type { Tone } from "@/lib/mock/types";

export const onboardingSteps = [
  { slug: "business", label: "Your business", hint: "Name and type" },
  { slug: "branch", label: "First branch", hint: "Name and review link" },
  { slug: "google", label: "Connect Google", hint: "Optional" },
  { slug: "replies", label: "AI replies", hint: "Style and approval" },
  { slug: "qr", label: "Your QR code", hint: "Ready to print" },
] as const;

export type StepSlug = (typeof onboardingSteps)[number]["slug"];

export function stepHref(slug: StepSlug) {
  return `/onboarding/${slug}`;
}

export type OnboardingDraft = {
  businessName?: string;
  businessType?: string;
  branch?: { id: string; name: string; googleMapsUrl: string; googleReviewUrl: string; qrCode: string };
  googleConnected?: boolean;
  tone?: Tone;
  approvalRule?: "2" | "3" | "all";
  autoPublish?: boolean;
};

export function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");
    return (
      host === "maps.app.goo.gl" ||
      host === "g.page" ||
      host === "maps.google.com" ||
      (host === "goo.gl" && url.pathname.startsWith("/maps")) ||
      (/^google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
}
