import { z } from "zod";
import { isGoogleMapsUrl } from "@/lib/onboarding";

// Shared by the forms (instant feedback) and the server actions (the real check).

export const PASSWORD_HINT = "At least 8 characters, with a letter and a number.";

export const email = z
  .string()
  .trim()
  .min(1, "Please enter your email.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "This email doesn’t look right.");

export const newPassword = z
  .string()
  .min(8, PASSWORD_HINT)
  .max(72, "Please use at most 72 characters.")
  .regex(/[a-z]/i, PASSWORD_HINT)
  .regex(/\d/, PASSWORD_HINT);

export const businessTypes = ["Restaurant", "Café", "Bakery", "Salon", "Shop", "Other"] as const;

export const businessName = z.string().trim().min(1, "Please enter your business name.").max(80, "Please use at most 80 characters.");
export const businessType = z.enum(businessTypes, { error: "Please pick a business type." });

export const branchName = z.string().trim().min(1, "Please enter a branch name.").max(80, "Please use at most 80 characters.");
export const mapsUrl = z
  .string()
  .trim()
  .min(1, "Please paste the Google Maps link.")
  .max(2048, "This link is too long.")
  .refine(isGoogleMapsUrl, "This is not a Google Maps link. Please copy it again.");

export const toneValues = ["Warm", "Friendly", "Professional", "Formal"] as const;
export const approvalRules = ["2", "3", "all"] as const;

/** First message per field, in the shape the forms show. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  /** Echoes submitted text fields so a failed submit doesn't clear them. */
  values?: Record<string, string>;
};
