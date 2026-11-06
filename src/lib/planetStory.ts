import type { Artifact, CatalogImage, Localized, Mission, PlanetId, Source, TimelineEvent } from "../types/catalog";
import type { ArtifactModel } from "../data/artifactModels";
import type { StoryImage } from "../data/storyImages";
import { NASA_AGENCY, categoryAllowsStatus, firstImageFor, relicForArtifacts, sourcesFor, type RemainCategory, type StoryCatalog } from "./storyMode";

/**
 * The horizontal "Two Worlds" story: one script per planet, each a sequence of
 * viewport-sized panels. Like the vertical chronicle, the script only references
 * catalog ids; dates, coordinates, statuses, photographs, and sources are resolved
 * from the catalog at render time.
 */

export type StoryPlanet = PlanetId;

export type PlanetStoryTheme = {
  /** Headline accent colour. */
  accent: string;
  /** Softer accent for rules, pills, and secondary labels. */
  accentSoft: string;
  /** Panel background colours: the base and a deeper shade used for the edges. */
  bg: string;
  bgDeep: string;
  /** Two ambient glows for the atmosphere layer. */
  glowA: string;
  glowB: string;
  /** Body copy colour on this theme. */
  paper: string;
  disc: "moon" | "mars";
  /** Drifting particles over the panels. Mars only. */
  dust: boolean;
};

type PanelBase = {
  id: string;
  kicker: Localized;
  title: Localized;
  narrative: Localized[];
  /** Picks a choreography in usePanelChoreography. Panels of the same layout can still move differently. */
  animationPreset: string;
};

export type IntroPanel = PanelBase & {
  layout: "intro";
  /** A storyImages id floated beside the planet. */
  imageId: string;
};

export type MissionBeat = {
  missionId: string;
  /** Optional storyImages id. */
  imageId?: string;
  /** Alternatively, the first catalog photograph of this artifact (must belong to the mission). */
  imageArtifactId?: string;
  /** The narrative thread that connects this mission to the ones around it. */
  note: Localized;
};

export type MissionsPanel = PanelBase & {
  layout: "missions";
  /** A hero photograph for the whole panel; beats can add their own. */
  imageId?: string;
  beats: MissionBeat[];
};

export type HardwarePanel = PanelBase & {
  layout: "hardware";
  artifactIds: string[];
  /** A Hall of Relics scan loaded only when this panel is near. */
  relicModelId?: string;
  imageId?: string;
  /** Short technical annotations drawn around the model. Narrative, not measurements. */
  callouts: Localized[];
};

export type SilencePanel = PanelBase & {
  layout: "silence";
  imageId: string;
  /** Catalog timeline event ids listed in order. */
  eventIds: string[];
};

export type RemainsGroup = {
  category: RemainCategory;
  artifactIds: string[];
};

export type RemainsPanel = PanelBase & {
  layout: "remains";
  /** "mission" folds several artifacts from one landing site into a single card. */
  groupBy: "mission" | "artifact";
  groups: RemainsGroup[];
};

export type FinalePanel = PanelBase & {
  layout: "finale";
  imageId: string;
};

export type StoryPanel = IntroPanel | MissionsPanel | HardwarePanel | SilencePanel | RemainsPanel | FinalePanel;

export type PlanetStory = {
  planet: StoryPlanet;
  /** Large label on the selection screen ("MOON"). */
  label: Localized;
  title: Localized;
  subtitle: Localized;
  /** Selection screen description. */
  description: Localized;
  /** Selection screen call to action. */
  cta: Localized;
  /** Selection screen background photograph (storyImages id). */
  posterImageId: string;
  theme: PlanetStoryTheme;
  panels: StoryPanel[];
};

export const planetStoryHref = (planet: StoryPlanet) => `/story/${planet}`;
export const explorePlanetHref = (planet: StoryPlanet) => `/explore/${planet}`;

export function isStoryPlanet(value: string | undefined): value is StoryPlanet {
  return value === "moon" || value === "mars";
}

export function missionsInPlanetStory(story: PlanetStory): string[] {
  const ids = new Set<string>();
  for (const panel of story.panels) {
    if (panel.layout === "missions") panel.beats.forEach((beat) => ids.add(beat.missionId));
  }
  return [...ids];
}

export function artifactsInPlanetStory(story: PlanetStory): string[] {
  const ids = new Set<string>();
  for (const panel of story.panels) {
    if (panel.layout === "hardware") panel.artifactIds.forEach((id) => ids.add(id));
    if (panel.layout === "remains") panel.groups.forEach((group) => group.artifactIds.forEach((id) => ids.add(id)));
  }
  return [...ids];
}

/* ---------------------------------------------------------------------------------- */
/* Resolution                                                                          */

export type ResolvedBeat = {
  beat: MissionBeat;
  mission: Mission;
  image: StoryImage | CatalogImage | null;
  /** Mission artifacts with a surveyed location, for an Explore link. */
  artifacts: Artifact[];
  sources: Source[];
};

export type ResolvedHardwareItem = {
  artifact: Artifact;
  mission: Mission | undefined;
  sources: Source[];
};

export type ResolvedRemainsCard = {
  key: string;
  category: RemainCategory;
  /** The mission the card is about (always set when grouping by mission). */
  mission: Mission | undefined;
  items: ResolvedHardwareItem[];
  image: CatalogImage | null;
};

const imageById = (catalog: StoryCatalog, id: string | undefined) => (id ? (catalog.images.find((image) => image.id === id) ?? null) : null);

export function resolveBeats(panel: MissionsPanel, catalog: StoryCatalog): ResolvedBeat[] {
  return panel.beats.flatMap((beat): ResolvedBeat[] => {
    const mission = catalog.missions.find((item) => item.id === beat.missionId);
    if (!mission || mission.agency !== NASA_AGENCY) return [];
    const artifacts = catalog.objects.filter((object) => object.missionId === mission.id);
    const imageArtifact = beat.imageArtifactId ? artifacts.find((object) => object.id === beat.imageArtifactId) : undefined;
    const image = imageById(catalog, beat.imageId) ?? firstImageFor(imageArtifact);
    return [{ beat, mission, image, artifacts, sources: sourcesFor(mission.sources, catalog.sources) }];
  });
}

export function resolveHardware(panel: HardwarePanel, catalog: StoryCatalog): { items: ResolvedHardwareItem[]; relic: ArtifactModel | null } {
  const items = panel.artifactIds.flatMap((id): ResolvedHardwareItem[] => {
    const artifact = catalog.objects.find((object) => object.id === id);
    if (!artifact) return [];
    const mission = catalog.missions.find((item) => item.id === artifact.missionId);
    if (mission && mission.agency !== NASA_AGENCY) return [];
    return [{ artifact, mission, sources: sourcesFor([artifact.location.sourceId, ...artifact.sources], catalog.sources) }];
  });
  return { items, relic: panel.relicModelId ? relicForArtifacts(panel.artifactIds, catalog.models, panel.relicModelId) : null };
}

export function resolveSilenceEvents(panel: SilencePanel, catalog: StoryCatalog): TimelineEvent[] {
  return panel.eventIds.flatMap((id) => {
    const event = catalog.events.find((item) => item.id === id);
    if (!event) return [];
    const mission = catalog.missions.find((item) => item.id === event.missionId);
    return mission && mission.agency === NASA_AGENCY ? [event] : [];
  });
}

export function resolveRemains(panel: RemainsPanel, catalog: StoryCatalog): ResolvedRemainsCard[] {
  const cards: ResolvedRemainsCard[] = [];
  for (const group of panel.groups) {
    const items = group.artifactIds.flatMap((id): ResolvedHardwareItem[] => {
      const artifact = catalog.objects.find((object) => object.id === id);
      if (!artifact || !categoryAllowsStatus(group.category, artifact.status)) return [];
      const mission = catalog.missions.find((item) => item.id === artifact.missionId);
      if (mission && mission.agency !== NASA_AGENCY) return [];
      return [{ artifact, mission, sources: sourcesFor([artifact.location.sourceId, ...artifact.sources], catalog.sources) }];
    });
    if (panel.groupBy === "artifact") {
      for (const item of items) {
        cards.push({ key: item.artifact.id, category: group.category, mission: item.mission, items: [item], image: firstImageFor(item.artifact) });
      }
      continue;
    }
    const byMission = new Map<string, ResolvedHardwareItem[]>();
    for (const item of items) {
      const list = byMission.get(item.artifact.missionId) ?? [];
      list.push(item);
      byMission.set(item.artifact.missionId, list);
    }
    for (const [missionId, list] of byMission) {
      const pictured = list.find((item) => item.artifact.images.length > 0);
      cards.push({ key: missionId, category: group.category, mission: list[0]?.mission, items: list, image: firstImageFor(pictured?.artifact) });
    }
  }
  return cards;
}

/* ---------------------------------------------------------------------------------- */
/* Validation                                                                          */

export function validatePlanetStory(story: PlanetStory, catalog: StoryCatalog): string[] {
  const issues: string[] = [];
  const missions = new Map(catalog.missions.map((mission) => [mission.id, mission]));
  const objects = new Map(catalog.objects.map((object) => [object.id, object]));
  const models = new Set(catalog.models.map((model) => model.id));
  const images = new Set(catalog.images.map((image) => image.id));
  const events = new Map(catalog.events.map((event) => [event.id, event]));
  const panelIds = new Set<string>();
  const prefix = `story/${story.planet}`;

  const requireImage = (id: string | undefined, where: string) => {
    if (id && !images.has(id)) issues.push(`${where}: unknown story image "${id}"`);
  };
  const requireMission = (id: string, where: string): Mission | undefined => {
    const mission = missions.get(id);
    if (!mission) {
      issues.push(`${where}: unknown mission "${id}"`);
      return undefined;
    }
    if (mission.agency !== NASA_AGENCY) issues.push(`${where}: mission "${id}" is ${mission.agency}, not NASA`);
    if (mission.planet !== story.planet) issues.push(`${where}: mission "${id}" is not a ${story.planet} mission`);
    return mission;
  };
  const requireArtifact = (id: string, where: string): Artifact | undefined => {
    const object = objects.get(id);
    if (!object) {
      issues.push(`${where}: unknown artifact "${id}"`);
      return undefined;
    }
    if (object.planet !== story.planet) issues.push(`${where}: artifact "${id}" is not on the ${story.planet}`);
    const mission = missions.get(object.missionId);
    if (mission && mission.agency !== NASA_AGENCY) issues.push(`${where}: artifact "${id}" belongs to a non-NASA mission`);
    return object;
  };

  requireImage(story.posterImageId, `${prefix}/poster`);
  if (story.panels.length === 0) issues.push(`${prefix}: no panels`);

  story.panels.forEach((panel, index) => {
    const where = `${prefix}/${panel.id}`;
    if (panelIds.has(panel.id)) issues.push(`duplicate panel id "${panel.id}"`);
    panelIds.add(panel.id);
    if (panel.narrative.length === 0) issues.push(`${where}: no narrative`);
    if (index === 0 && panel.layout !== "intro") issues.push(`${where}: a story must open with an intro panel`);
    if (index === story.panels.length - 1 && panel.layout !== "finale") issues.push(`${where}: a story must close with a finale panel`);

    switch (panel.layout) {
      case "intro":
      case "finale":
      case "silence":
        requireImage(panel.imageId, where);
        if (panel.layout === "silence") {
          for (const id of panel.eventIds) {
            const event = events.get(id);
            if (!event) issues.push(`${where}: unknown event "${id}"`);
            else requireMission(event.missionId, where);
          }
        }
        break;
      case "missions": {
        requireImage(panel.imageId, where);
        if (panel.beats.length === 0) issues.push(`${where}: no mission beats`);
        for (const beat of panel.beats) {
          const mission = requireMission(beat.missionId, where);
          requireImage(beat.imageId, where);
          if (beat.imageArtifactId) {
            const object = requireArtifact(beat.imageArtifactId, where);
            if (object && mission && object.missionId !== mission.id) issues.push(`${where}: artifact "${beat.imageArtifactId}" is not part of ${mission.id}`);
            if (object && object.images.length === 0) issues.push(`${where}: artifact "${beat.imageArtifactId}" has no photograph`);
          }
        }
        break;
      }
      case "hardware":
        requireImage(panel.imageId, where);
        if (panel.artifactIds.length === 0) issues.push(`${where}: no artifacts`);
        panel.artifactIds.forEach((id) => requireArtifact(id, where));
        if (panel.relicModelId && !models.has(panel.relicModelId)) issues.push(`${where}: unknown model "${panel.relicModelId}"`);
        break;
      case "remains":
        if (panel.groups.length === 0) issues.push(`${where}: no groups`);
        for (const group of panel.groups) {
          for (const id of group.artifactIds) {
            const object = requireArtifact(id, where);
            if (object && !categoryAllowsStatus(group.category, object.status)) issues.push(`${where}: "${id}" is ${object.status}, which does not fit "${group.category}"`);
          }
        }
        break;
    }
  });

  return issues;
}
