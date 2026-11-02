import { describe, expect, it } from "vitest";
import { reviewInput, templateSuggestions } from "./suggestions";

const valid = { code: "0123456789ab", rating: 4, attributes: ["Food quality"], comment: "Nice lunch", website: "" };

describe("reviewInput", () => {
  it("accepts a normal submission", () => {
    expect(reviewInput.safeParse(valid).success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    expect(reviewInput.safeParse({ ...valid, website: "http://spam.example" }).success).toBe(false);
  });

  it("rejects ratings outside 1 to 5 and non-integers", () => {
    for (const rating of [0, 6, 3.5]) expect(reviewInput.safeParse({ ...valid, rating }).success).toBe(false);
  });

  it("rejects a malformed code and an oversized comment", () => {
    expect(reviewInput.safeParse({ ...valid, code: "demo-downtown" }).success).toBe(false);
    expect(reviewInput.safeParse({ ...valid, comment: "a".repeat(501) }).success).toBe(false);
  });

  it("rejects too many attributes", () => {
    expect(reviewInput.safeParse({ ...valid, attributes: Array(9).fill("Food quality") }).success).toBe(false);
  });
});

describe("templateSuggestions", () => {
  it("uses only the business name, rating, chosen attributes and comment", () => {
    const suggestions = templateSuggestions("Chai Point", 5, ["Friendly staff", "Cleanliness"], "Came for a birthday lunch");
    expect(suggestions.length).toBeGreaterThan(0);
    for (const suggestion of suggestions) {
      expect(suggestion).not.toMatch(/\b(dish|price|waiter|manager|discount)\b/i);
      expect(suggestion).toMatch(/Chai Point|out of 5/);
    }
    expect(suggestions.join(" ")).toContain("friendly staff and cleanliness");
    expect(suggestions.join(" ")).toContain("Came for a birthday lunch");
  });

  it("keeps a low rating unhappy", () => {
    const suggestions = templateSuggestions("Chai Point", 1, [], "");
    expect(suggestions[0]).toBe("I had a poor experience at Chai Point.");
  });

  it("returns no duplicates", () => {
    const suggestions = templateSuggestions("Chai Point", 3, [], "");
    expect(new Set(suggestions).size).toBe(suggestions.length);
  });
});
