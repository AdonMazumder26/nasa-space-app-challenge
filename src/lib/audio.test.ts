import { describe, expect, it } from "vitest";
import { parseSoundPref } from "./audio";

describe("parseSoundPref", () => {
  it("uses a quiet default when nothing is stored", () => {
    expect(parseSoundPref(null)).toEqual({ enabled: true, volume: 0.55 });
  });

  it("keeps an explicit mute and ignores an out-of-range volume", () => {
    expect(parseSoundPref('{"enabled":false,"volume":4}')).toEqual({ enabled: false, volume: 0.55 });
  });

  it("ignores broken storage", () => {
    expect(parseSoundPref("not-json")).toEqual({ enabled: true, volume: 0.55 });
  });
});
