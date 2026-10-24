import { describe, expect, it } from "vitest";
import { catalog } from "../data/catalog";
import { endingFor, lastContactFor, yearsSince } from "./story";

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

describe("endingFor", () => {
  const object = (id: string) => catalog.objects.find((item) => item.id === id)!;
  const mission = (id: string) => catalog.missions.find((item) => item.id === id);

  it("reports silence for a rover whose last signal is recorded", () => {
    expect(endingFor(object("opportunity"), mission("mer-opportunity"), catalog.events)).toMatchObject({ kind: "silence", date: "2018-06-10" });
  });

  it("reports a planned retirement for InSight rather than a silence", () => {
    expect(endingFor(object("insight"), mission("insight"), catalog.events)).toMatchObject({ kind: "retired", date: "2022-12-21" });
  });

  it("keeps active rovers active and crashes as impacts", () => {
    expect(endingFor(object("curiosity"), mission("msl-curiosity"), catalog.events)).toEqual({ kind: "active" });
    expect(endingFor(object("beresheet-impact"), mission("beresheet"), catalog.events)).toMatchObject({ kind: "impact", date: "2019-04-11" });
  });
});

describe("yearsSince", () => {
  it("counts whole years and respects the anniversary", () => {
    expect(yearsSince("1982-11-11", new Date(Date.UTC(2026, 9, 23)))).toBe(43);
    expect(yearsSince("1982-11-11", new Date(Date.UTC(2026, 10, 11)))).toBe(44);
  });

  it("returns null for missing or future dates", () => {
    expect(yearsSince(undefined)).toBeNull();
    expect(yearsSince("2999-01-01", new Date(Date.UTC(2026, 0, 1)))).toBeNull();
  });
});
