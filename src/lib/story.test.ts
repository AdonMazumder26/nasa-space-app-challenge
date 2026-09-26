import { describe, expect, it } from "vitest";
import { catalog } from "../data/catalog";
import { lastContactFor } from "./story";

describe("lastContactFor", () => {
  it("uses the catalog's own last-contact event for Viking 1", () => {
    const event = lastContactFor("viking-1-lander", catalog.events);
    expect(event?.date).toBe("1982-11-11");
  });

  it("does not turn a mission end into a last contact", () => {
    expect(lastContactFor("insight", catalog.events)).toBeNull();
    expect(lastContactFor("apollo-11-descent-stage", catalog.events)).toBeNull();
  });
});
