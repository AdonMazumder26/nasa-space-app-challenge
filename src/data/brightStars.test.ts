import { describe, expect, it } from "vitest";
import { brightStars } from "./brightStars";

describe("bright star sphere", () => {
  it("includes the naked-eye catalog, including Sirius", () => {
    expect(brightStars.length).toBeGreaterThan(2000);
    const sirius = brightStars.find(([ra, dec, magnitude]) => Math.abs(ra - 101.29) < 0.2 && Math.abs(dec + 16.72) < 0.2 && magnitude < 0);
    expect(sirius).toBeTruthy();
  });
});
