import type { ExplorationSave } from "./exploration";

export type GuidedSite = { id: string; missionId: string };

export function sitesForMission(sites: readonly GuidedSite[], missionId: string): GuidedSite[] {
  return sites.filter((site) => site.missionId === missionId);
}

export function nextUnopenedSite(sites: readonly GuidedSite[], save: ExplorationSave): GuidedSite | null {
  return sites.find((site) => !save.records[site.id]?.exploredAt) ?? null;
}

export function openedSiteCount(sites: readonly GuidedSite[], save: ExplorationSave): number {
  return sites.filter((site) => save.records[site.id]?.exploredAt).length;
}
