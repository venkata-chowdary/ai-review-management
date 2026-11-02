// USD per million tokens, from https://ai.google.dev/gemini-api/docs/pricing.
// Thinking tokens are billed at the output rate. A model that is not listed
// gets a null cost instead of a guess.
export const modelPrices: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "gemini-2.5-flash": { inputPerMillion: 0.3, outputPerMillion: 2.5 },
};
