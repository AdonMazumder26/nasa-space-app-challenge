import { describe, expect, it } from "vitest";
import { surfaceDistanceKm } from "./distance";

describe("surfaceDistanceKm", () => {
  it("is zero for the same point", () => {
    expect(surfaceDistanceKm("moon", 0.67416, 23.47314, 0.67416, 23.47314)).toBeCloseTo(0, 6);
  });

  it("matches one degree of longitude on the lunar equator", () => {
    const degree = (1737.4 * Math.PI) / 180;
    expect(surfaceDistanceKm("moon", 0, 0, 0, 1)).toBeCloseTo(degree, 1);
  });

  it("places the Apollo 11 descent stage and EASEP within a short walk", () => {
    const km = surfaceDistanceKm("moon", 0.67416, 23.47314, 0.67322, 23.47315);
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(0.2);
  });

  it("is longer on Mars than on the Moon for the same angle", () => {
    expect(surfaceDistanceKm("mars", 0, 0, 0, 1)).toBeGreaterThan(surfaceDistanceKm("moon", 0, 0, 0, 1));
  });
});
