import { describe, expect, it } from "vitest";
import { filterObjects, searchObjects } from "./filtering";
import type { Artifact, Filters, Mission } from "../types/catalog";

const missions: Mission[] = [
  {
    id: "m-early",
    name: { en: "Early", bn: "আগের" },
    agency: "NASA",
    country: "USA",
    planet: "moon",
    missionType: "lander",
    arrivalDate: "1969-07-20",
    status: "mission_complete",
    description: { en: "Early mission", bn: "আগের অভিযান" },
    objectives: { en: "Land", bn: "অবতরণ" },
    sources: ["src"],
  },
  {
    id: "m-late",
    name: { en: "Viking", bn: "ভাইকিং" },
    agency: "NASA",
    country: "USA",
    planet: "mars",
    missionType: "lander",
    arrivalDate: "1976-07-20",
    status: "communication_lost",
    description: { en: "Mars lander", bn: "মঙ্গল ল্যান্ডার" },
    objectives: { en: "Land", bn: "অবতরণ" },
    sources: ["src"],
  },
];

function object(partial: Pick<Artifact, "id" | "planet" | "missionId" | "type" | "status"> & { name?: string; place?: string }): Artifact {
  const name = partial.name ?? partial.id;
  return {
    id: partial.id,
    name: { en: name, bn: name },
    planet: partial.planet,
    type: partial.type,
    status: partial.status,
    missionId: partial.missionId,
    location: {
      planet: partial.planet,
      latitude: 1,
      longitude: 2,
      coordinateSystem: "planetocentric",
      precision: "exact",
      locationName: partial.place ?? "Site",
      sourceId: "src",
    },
    summary: { en: "", bn: "" },
    story: {
      en: { whatIsIt: "", whatHappened: "", whyLeft: "", whyItMatters: "" },
      bn: { whatIsIt: "", whatHappened: "", whyLeft: "", whyItMatters: "" },
    },
    significance: { en: "", bn: "" },
    sources: ["src"],
    images: [],
  };
}

const objects = [
  object({ id: "eagle", planet: "moon", missionId: "m-early", type: "descent_stage", status: "mission_complete", name: "Eagle", place: "Tranquility Base" }),
  object({ id: "rover", planet: "moon", missionId: "m-early", type: "rover", status: "mission_complete", name: "Rover" }),
  object({ id: "viking", planet: "mars", missionId: "m-late", type: "lander", status: "communication_lost", name: "Viking", place: "Chryse Planitia" }),
];

const openFilters: Filters = { types: [], statuses: [], missionId: null, throughYear: 2026 };

describe("filterObjects", () => {
  it("keeps only the active planet", () => {
    const visible = filterObjects(objects, missions, "moon", "", openFilters);
    expect(visible.map((item) => item.id)).toEqual(["eagle", "rover"]);
  });

  it("filters by type and hides objects that arrived after the timeline year", () => {
    const visible = filterObjects(objects, missions, "mars", "", { ...openFilters, throughYear: 1970 });
    expect(visible).toHaveLength(0);
    const typed = filterObjects(objects, missions, "moon", "", { ...openFilters, types: ["rover"] });
    expect(typed.map((item) => item.id)).toEqual(["rover"]);
  });

  it("searches names, places, and mission names", () => {
    expect(searchObjects(objects, missions, "tranquility").map((item) => item.id)).toEqual(["eagle"]);
    expect(searchObjects(objects, missions, "viking").map((item) => item.id)).toEqual(["viking"]);
  });
});
