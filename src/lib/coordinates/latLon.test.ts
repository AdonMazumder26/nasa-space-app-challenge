import { describe, expect, it } from "vitest";
import { latLonToVector } from "./latLon";

const R = 2;

describe("latLonToVector", () => {
  it("places the north pole on +Y", () => {
    const pole = latLonToVector(90, 40, R);
    expect(pole.y).toBeCloseTo(R, 6);
    expect(pole.x).toBeCloseTo(0, 6);
    expect(pole.z).toBeCloseTo(0, 6);
  });

  it("places the south pole on -Y", () => {
    const pole = latLonToVector(-90, -20, R);
    expect(pole.y).toBeCloseTo(-R, 6);
    expect(pole.x).toBeCloseTo(0, 6);
    expect(pole.z).toBeCloseTo(0, 6);
  });

  it("places lon 0 lat 0 on +X so the texture center matches the prime meridian", () => {
    const point = latLonToVector(0, 0, R);
    expect(point.x).toBeCloseTo(R, 6);
    expect(point.y).toBeCloseTo(0, 6);
    expect(point.z).toBeCloseTo(0, 6);
  });

  it("places opposite longitudes on opposite sides of the sphere", () => {
    const east = latLonToVector(0, 90, R);
    const west = latLonToVector(0, -90, R);
    expect(east.z).toBeCloseTo(-R, 6);
    expect(west.z).toBeCloseTo(R, 6);
    expect(east.x + west.x).toBeCloseTo(0, 6);
  });

  it("is deterministic and scales with radius", () => {
    const a = latLonToVector(0.67416, 23.47314, 1);
    const b = latLonToVector(0.67416, 23.47314, 1);
    const c = latLonToVector(0.67416, 23.47314, 3);
    expect(a).toEqual(b);
    expect(c.x / a.x).toBeCloseTo(3, 6);
    expect(c.y / a.y).toBeCloseTo(3, 6);
    expect(c.z / a.z).toBeCloseTo(3, 6);
  });

  it("keeps Apollo 11 near the nearside meridian and above the equator", () => {
    const eagle = latLonToVector(0.67416, 23.47314, 1);
    expect(eagle.y).toBeGreaterThan(0);
    expect(eagle.x).toBeGreaterThan(0.8);
  });
});
