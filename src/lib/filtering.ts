import { yearOf } from "./coordinates/latLon";
import type { Artifact, Filters, Mission, PlanetId, TimelineEvent } from "../types/catalog";

export function missionById(missions: Mission[], id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id);
}

export function objectHaystack(object: Artifact, mission: Mission | undefined): string {
  return [
    object.name.en,
    object.name.bn,
    object.location.locationName,
    object.location.region ?? "",
    mission?.name.en ?? "",
    mission?.name.bn ?? "",
    mission?.agency ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function filterObjects(
  objects: Artifact[],
  missions: Mission[],
  planet: PlanetId,
  query: string,
  filters: Filters,
): Artifact[] {
  const needle = query.trim().toLowerCase();
  return objects
    .filter((object) => {
      if (object.planet !== planet) return false;
      if (filters.types.length > 0 && !filters.types.includes(object.type)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(object.status)) return false;
      if (filters.missionId && object.missionId !== filters.missionId) return false;
      const mission = missionById(missions, object.missionId);
      const arrival = yearOf(mission?.arrivalDate);
      if (arrival !== null && arrival > filters.throughYear) return false;
      if (needle && !objectHaystack(object, mission).includes(needle)) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      const aYear = yearOf(missionById(missions, a.missionId)?.arrivalDate) ?? 0;
      const bYear = yearOf(missionById(missions, b.missionId)?.arrivalDate) ?? 0;
      if (aYear !== bYear) return aYear - bYear;
      return a.name.en.localeCompare(b.name.en);
    });
}

export function searchObjects(
  objects: Artifact[],
  missions: Mission[],
  query: string,
): Artifact[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return objects
    .filter((object) => objectHaystack(object, missionById(missions, object.missionId)).includes(needle))
    .slice(0, 8);
}

export function eventsForObjects(events: TimelineEvent[], objects: Artifact[]): TimelineEvent[] {
  const ids = new Set(objects.map((object) => object.id));
  return events.filter((event) => ids.has(event.objectId));
}

export function catalogYearBounds(missions: Mission[]): { min: number; max: number } {
  const years = missions
    .flatMap((mission) => [yearOf(mission.arrivalDate), yearOf(mission.endDate), yearOf(mission.launchDate)])
    .filter((year): year is number => year !== null);
  const max = Math.max(...years, new Date().getFullYear());
  const min = Math.min(...years, max);
  return { min, max };
}
