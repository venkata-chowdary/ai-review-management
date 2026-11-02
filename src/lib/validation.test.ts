import { describe, expect, it } from "vitest";
import { reviewUrl } from "./validation";

describe("reviewUrl", () => {
  it("accepts Google's review links", () => {
    expect(reviewUrl.safeParse("https://g.page/r/CdpEYxbcID85EBM/review").success).toBe(true);
    expect(reviewUrl.safeParse("https://search.google.com/local/writereview?placeid=ChIJabc").success).toBe(true);
  });

  it("rejects other hosts, http, and the wrong paths", () => {
    for (const link of [
      "https://evil.example/r/abc/review",
      "http://g.page/r/abc/review",
      "https://g.page/r/abc",
      "https://g.page.evil.example/r/abc/review",
      "https://search.google.com/local/writereview",
      "https://maps.app.goo.gl/abc",
      "javascript:alert(1)",
      "not a link",
    ])
      expect(reviewUrl.safeParse(link).success, link).toBe(false);
  });
});
