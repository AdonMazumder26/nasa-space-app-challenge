import type { TimelineEvent } from "../types/catalog";

/**
 * These ids are the catalog events whose own wording records a last contact.
 * A mission end date is not treated as a last-contact time.
 */
const LAST_CONTACT_IDS = new Set([
  "lunokhod-1-silence",
  "viking-1-silence",
  "viking-2-silence",
  "pathfinder-silence",
  "spirit-silence",
  "opportunity-silence",
]);

export function lastContactFor(objectId: string, events: TimelineEvent[]): TimelineEvent | null {
  return events.find((event) => event.objectId === objectId && LAST_CONTACT_IDS.has(event.id)) ?? null;
}

export function eventsForObject(objectId: string, events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((event) => event.objectId === objectId).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function eventsForMission(missionId: string, events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((event) => event.missionId === missionId).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
