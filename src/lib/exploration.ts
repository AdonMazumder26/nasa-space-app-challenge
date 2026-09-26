import { latLonToVector } from "./coordinates/latLon";
import type { PlanetId } from "../types/catalog";

export type ViewLevel = "global" | "region" | "site" | "artifact";
export type FlightPhase = "locating" | "acquired" | "idle";

export type SurfaceView = {
  level: ViewLevel;
  distance: number;
  inView: number;
  latitude: number;
  longitude: number;
};

/** When the user found a site, and when they opened its story. Dates are the user's, not the mission's. */
export type SiteRecord = {
  discoveredAt?: string;
  exploredAt?: string;
};

export type Expedition = {
  artifactIds: string[];
  currentIndex: number;
  status: "draft" | "active" | "completed";
};

export type ExplorationSave = {
  records: Record<string, SiteRecord>;
  expeditions: Partial<Record<PlanetId, Expedition>>;
};

const DISCOVERY_KEY = "abnf-discovered";
const SAVE_KEY = "abnf-exploration";

export function emptyExploration(): ExplorationSave {
  return { records: {}, expeditions: {} };
}

export function emptyExpedition(): Expedition {
  return { artifactIds: [], currentIndex: 0, status: "draft" };
}

/** Default camera distance is about 2.8. Discovery starts once the user comes closer than that. */
export function viewLevel(distance: number, selected: boolean): ViewLevel {
  if (selected && distance < 1.75) return "artifact";
  if (distance < 1.75) return "site";
  if (distance < 2.45) return "region";
  return "global";
}

/** Angular radius, in radians, inside which a site can be detected. Null while still in the global view. */
export function discoveryAngle(distance: number): number | null {
  if (distance > 2.45) return null;
  const t = Math.min(1, Math.max(0, (distance - 1.5) / (2.45 - 1.5)));
  return 0.32 + t * 0.28;
}

export function readDiscovered(): string[] {
  try {
    const raw = sessionStorage.getItem(DISCOVERY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeDiscovered(ids: string[]) {
  try {
    sessionStorage.setItem(DISCOVERY_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing can refuse storage. The in-memory set still works for this visit.
  }
}

function browserStore(kind: "localStorage" | "sessionStorage"): Storage | null {
  try {
    return globalThis[kind];
  } catch {
    return null;
  }
}

export function readExploration(): ExplorationSave {
  const saved = readSaved();
  if (Object.keys(saved.records).length > 0) return saved;
  const seeded = { ...saved, records: { ...saved.records } };
  for (const id of readDiscovered()) {
    if (!seeded.records[id]) seeded.records[id] = {};
  }
  if (Object.keys(seeded.records).length > 0) writeExploration(seeded);
  return seeded;
}

function readSaved(): ExplorationSave {
  try {
    const raw = browserStore("localStorage")?.getItem(SAVE_KEY);
    if (!raw) return emptyExploration();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyExploration();
    const records = readRecords((parsed as { records?: unknown }).records);
    const expeditions = readExpeditions((parsed as { expeditions?: unknown }).expeditions);
    return { records, expeditions };
  } catch {
    return emptyExploration();
  }
}

function readRecords(value: unknown): Record<string, SiteRecord> {
  if (!value || typeof value !== "object") return {};
  const records: Record<string, SiteRecord> = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== "object") continue;
    const discoveredAt = (entry as { discoveredAt?: unknown }).discoveredAt;
    const exploredAt = (entry as { exploredAt?: unknown }).exploredAt;
    records[id] = {
      ...(typeof discoveredAt === "string" ? { discoveredAt } : {}),
      ...(typeof exploredAt === "string" ? { exploredAt } : {}),
    };
  }
  return records;
}

function readExpeditions(value: unknown): ExplorationSave["expeditions"] {
  if (!value || typeof value !== "object") return {};
  const expeditions: ExplorationSave["expeditions"] = {};
  for (const planet of ["moon", "mars"] as const) {
    const entry = (value as Record<string, unknown>)[planet];
    if (!entry || typeof entry !== "object") continue;
    const ids = (entry as { artifactIds?: unknown }).artifactIds;
    const status = (entry as { status?: unknown }).status;
    const index = (entry as { currentIndex?: unknown }).currentIndex;
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) continue;
    if (status !== "draft" && status !== "active" && status !== "completed") continue;
    expeditions[planet] = {
      artifactIds: ids,
      status,
      currentIndex: typeof index === "number" && index >= 0 ? Math.floor(index) : 0,
    };
  }
  return expeditions;
}

export function writeExploration(save: ExplorationSave) {
  try {
    browserStore("localStorage")?.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // The in-memory copy still covers this visit.
  }
  writeDiscovered(Object.keys(save.records));
}

export function markDiscovered(save: ExplorationSave, ids: readonly string[], discoveredAt: string): ExplorationSave {
  let changed = false;
  const records = { ...save.records };
  for (const id of ids) {
    if (records[id]) continue;
    records[id] = { discoveredAt };
    changed = true;
  }
  return changed ? { ...save, records } : save;
}

export function markExplored(save: ExplorationSave, id: string, exploredAt: string): ExplorationSave {
  const current = save.records[id];
  if (current?.exploredAt) return save;
  return {
    ...save,
    records: { ...save.records, [id]: { discoveredAt: current?.discoveredAt ?? exploredAt, exploredAt } },
  };
}

export function toggleExpeditionSite(expedition: Expedition | undefined, id: string): Expedition {
  const source = !expedition || expedition.status === "completed" ? emptyExpedition() : expedition;
  const artifactIds = [...source.artifactIds];
  const index = artifactIds.indexOf(id);
  if (index >= 0) artifactIds.splice(index, 1);
  else artifactIds.push(id);
  const currentIndex = Math.min(source.currentIndex, Math.max(0, artifactIds.length - 1));
  return { artifactIds, currentIndex, status: artifactIds.length === 0 ? "draft" : source.status === "active" ? "active" : "draft" };
}

export function moveExpeditionSite(expedition: Expedition, id: string, direction: -1 | 1): Expedition {
  const artifactIds = [...expedition.artifactIds];
  const index = artifactIds.indexOf(id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= artifactIds.length) return expedition;
  const swap = artifactIds[next];
  artifactIds[next] = artifactIds[index];
  artifactIds[index] = swap;
  return { ...expedition, artifactIds };
}

type DiscoveryCandidate = {
  id: string;
  planet: PlanetId;
  missionId: string;
  hasImage: boolean;
};

/**
 * Picks one catalogued site on the current planet.
 * Undiscovered sites outrank sites that were found but not opened. Explored sites are skipped.
 * Returns null once every site on that planet has been opened.
 */
export function pickDiscovery(
  objects: readonly DiscoveryCandidate[],
  planet: PlanetId,
  records: Record<string, SiteRecord>,
  currentId: string | null,
  turn: number,
): string | null {
  const knownMissions = new Set(objects.filter((object) => records[object.id]).map((object) => object.missionId));
  const ranked = objects
    .filter((object) => object.planet === planet && object.id !== currentId)
    .flatMap((object) => {
      const record = records[object.id];
      if (record?.exploredAt) return [];
      const score = (record ? 40 : 100) + (object.hasImage ? 8 : 0) + (knownMissions.has(object.missionId) ? 0 : 6);
      return [{ id: object.id, score }];
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  if (ranked.length === 0) return null;
  const best = ranked[0].score;
  const band = ranked.filter((item) => item.score === best);
  const index = ((turn % band.length) + band.length) % band.length;
  return band[index].id;
}

/** Facing-hemisphere radius for a deliberate scan. Wider than passive discovery, tighter when the camera is close. */
export function scanAngle(distance: number): number {
  if (distance >= 2.45) return 1.15;
  if (distance >= 1.75) return 0.7;
  return 0.32;
}

export function sitesFacing(
  objects: readonly { id: string; planet: PlanetId; latitude: number; longitude: number }[],
  planet: PlanetId,
  latitude: number,
  longitude: number,
  angleRad: number,
): string[] {
  const origin = latLonToVector(latitude, longitude, 1);
  const limit = Math.cos(angleRad);
  return objects
    .filter((object) => object.planet === planet)
    .map((object) => {
      const vector = latLonToVector(object.latitude, object.longitude, 1);
      return { id: object.id, dot: origin.x * vector.x + origin.y * vector.y + origin.z * vector.z };
    })
    .filter((item) => item.dot >= limit)
    .sort((a, b) => b.dot - a.dot || a.id.localeCompare(b.id))
    .map((item) => item.id);
}
