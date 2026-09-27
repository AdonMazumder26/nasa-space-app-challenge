import { describe, expect, it } from "vitest";
import { APPROACH_OFFSET, guideFrame, STAND_OFFSET } from "./surfaceGuide";

describe("guide surface placement", () => {
  it("stands off the marker on the same site", () => {
    const stand = guideFrame(0.6742, 23.4731, STAND_OFFSET);
    const approach = guideFrame(0.6742, 23.4731, APPROACH_OFFSET);
    const marker = guideFrame(0.6742, 23.4731, 0);
    expect(stand.position.distanceTo(marker.position)).toBeGreaterThan(0.05);
    expect(approach.position.distanceTo(marker.position)).toBeGreaterThan(stand.position.distanceTo(marker.position));
    expect(stand.position.length()).toBeGreaterThan(1);
  });
});
