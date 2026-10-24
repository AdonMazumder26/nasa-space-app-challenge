import type { Artifact, Mission, TimelineEvent } from "../types/catalog";

/**
 * A last contact is an event the catalog itself records as a loss of signal.
 * A mission end date or a planned shutdown is not treated as a last-contact time.
 */
export function lastContactFor(objectId: string, events: TimelineEvent[]): TimelineEvent | null {
  const losses = events.filter((event) => event.objectId === objectId && event.kind === "loss").sort((a, b) => a.date.localeCompare(b.date));
  return losses.at(-1) ?? null;
}

export function eventsForObject(objectId: string, events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((event) => event.objectId === objectId).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function eventsForMission(missionId: string, events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((event) => event.missionId === missionId).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export type Ending =
  | { kind: "silence"; date: string; event: TimelineEvent }
  | { kind: "retired"; date: string; event: TimelineEvent | null }
  | { kind: "impact"; date: string | null }
  | { kind: "active" }
  | { kind: "complete"; date: string | null }
  | { kind: "unknown" };

/** How the object's working life ended, using only what the catalog records. */
export function endingFor(object: Artifact, mission: Mission | undefined, events: TimelineEvent[]): Ending {
  if (object.status === "active") return { kind: "active" };
  const own = eventsForObject(object.id, events);
  const silence = lastContactFor(object.id, events);
  if (silence) return { kind: "silence", date: silence.date, event: silence };
  if (object.status === "impacted" || object.status === "destroyed") return { kind: "impact", date: mission?.arrivalDate ?? null };
  const retired = own.filter((event) => event.kind === "retired").at(-1) ?? null;
  if (retired) return { kind: "retired", date: retired.date, event: retired };
  if (object.status === "mission_complete" || object.status === "inactive") return { kind: "complete", date: mission?.endDate ?? null };
  return { kind: "unknown" };
}

/** Whole years between an ISO date and now. Null when the date is missing or in the future. */
export function yearsSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(then.getTime())) return null;
  let years = now.getUTCFullYear() - then.getUTCFullYear();
  const beforeAnniversary =
    now.getUTCMonth() < then.getUTCMonth() || (now.getUTCMonth() === then.getUTCMonth() && now.getUTCDate() < then.getUTCDate());
  if (beforeAnniversary) years -= 1;
  return years < 0 ? null : years;
}

/** The order the reader shows chapters in. Ids double as anchor targets. */
export const CHAPTER_IDS = ["what", "happened", "signal", "stayed", "remains", "matters"] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];
