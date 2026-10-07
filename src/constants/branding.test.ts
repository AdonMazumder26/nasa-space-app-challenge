import { describe, expect, it } from "vitest";
import { BRAND } from "./branding";
import { formatPageTitle } from "../hooks/usePageTitle";

describe("branding constants", () => {
  it("defines official product name and subtitle", () => {
    expect(BRAND.PROJECT_NAME).toBe("Beyond the Signal");
    expect(BRAND.PROJECT_DISPLAY_NAME).toBe("BEYOND THE SIGNAL");
    expect(BRAND.PROJECT_SUBTITLE).toBe(
      "Mapping the machines humanity left behind on the Moon and Mars.",
    );
  });

  it("preserves official challenge name and label", () => {
    expect(BRAND.CHALLENGE_NAME).toBe(
      "Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars",
    );
    expect(BRAND.CHALLENGE_LABEL).toBe(
      "NASA Space Apps Challenge 2026 · Challenge 1",
    );
    expect(BRAND.CHALLENGE_SHORT).toBe("NASA Space Apps · Challenge 1");
  });

  it("formats page titles correctly", () => {
    expect(formatPageTitle()).toBe(
      "Beyond the Signal | Mapping the Machines Humanity Left Behind",
    );
    expect(formatPageTitle("")).toBe(
      "Beyond the Signal | Mapping the Machines Humanity Left Behind",
    );
    expect(formatPageTitle("Explore the Moon & Mars")).toBe(
      "Explore the Moon & Mars | Beyond the Signal",
    );
    expect(formatPageTitle("Apollo 11 Descent Stage")).toBe(
      "Apollo 11 Descent Stage | Beyond the Signal",
    );
    expect(formatPageTitle("Timeline")).toBe("Timeline | Beyond the Signal");
    expect(formatPageTitle("About")).toBe("About | Beyond the Signal");
    expect(formatPageTitle("Sources & Evidence")).toBe(
      "Sources & Evidence | Beyond the Signal",
    );
  });
});
