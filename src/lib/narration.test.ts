import { describe, expect, it } from "vitest";
import { narrationVolume, pickNarrationVoice } from "./narration";

describe("narration voice choice", () => {
  const voices = [{ lang: "en-US" }, { lang: "bn-BD" }, { lang: "en-GB" }];

  it("picks an English voice for English", () => {
    expect(pickNarrationVoice(voices, "en")?.lang).toBe("en-US");
  });

  it("picks a Bangla voice when one exists", () => {
    expect(pickNarrationVoice(voices, "bn")?.lang).toBe("bn-BD");
  });

  it("does not fall back to English for Bangla", () => {
    expect(pickNarrationVoice([{ lang: "en-US" }], "bn")).toBeNull();
  });

  it("keeps speech above the quiet ambient floor", () => {
    expect(narrationVolume(0.35)).toBeGreaterThan(0.6);
    expect(narrationVolume(0)).toBe(0);
  });
});
