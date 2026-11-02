import { z } from "zod";

export const qrAttributes: Record<string, string[]> = {
  Restaurant: ["Food quality", "Friendly staff", "Ambience", "Quick service", "Cleanliness", "Good value", "Long wait"],
  Café: ["Coffee quality", "Friendly staff", "Ambience", "Quick service", "Cleanliness", "Good value", "Long wait"],
  Bakery: ["Freshness", "Taste", "Friendly staff", "Variety", "Cleanliness", "Good value", "Long wait"],
  Salon: ["Skill", "Friendly staff", "Cleanliness", "On time", "Good value", "Ambience", "Long wait"],
  Shop: ["Product range", "Friendly staff", "Helpful advice", "Cleanliness", "Good value", "Easy to find things", "Long wait"],
  Other: ["Quality", "Friendly staff", "Cleanliness", "Quick service", "Good value", "Ambience", "Long wait"],
};

// "website" is a honeypot: people never see it, so it must arrive empty.
export const reviewInput = z.object({
  code: z.string().regex(/^[0-9a-f]{12}$/),
  rating: z.number().int().min(1).max(5),
  attributes: z.array(z.string().max(40)).max(8),
  comment: z.string().trim().max(500),
  website: z.string().max(0),
});

// Used when Gemini is unavailable. Built only from what the customer chose and
// wrote, so nothing is invented.
export function templateSuggestions(businessName: string, rating: number, attributes: string[], comment: string) {
  const opener = [
    "",
    `I had a poor experience at ${businessName}.`,
    `My visit to ${businessName} was disappointing.`,
    `My visit to ${businessName} was okay.`,
    `Good visit to ${businessName} overall.`,
    `Really enjoyed my visit to ${businessName}.`,
  ][rating];
  const lower = attributes.map((attribute) => attribute.toLowerCase());
  const noted = lower.length < 2 ? (lower[0] ?? "") : `${lower.slice(0, -1).join(", ")} and ${lower.at(-1)}`;
  const extra = comment.trim() ? ` ${comment.trim()}` : "";
  const capitalised = noted.charAt(0).toUpperCase() + noted.slice(1);
  return [
    `${opener}${noted ? ` What stood out: ${noted}.` : ""}${extra}`,
    `${rating} out of 5 from me.${noted ? ` ${capitalised} ${attributes.length > 1 ? "were" : "was"} what I noticed most.` : ""}${extra}`,
    `${opener}${extra || (noted ? ` ${capitalised}.` : "")}`,
  ].filter((suggestion, index, all) => all.indexOf(suggestion) === index);
}
