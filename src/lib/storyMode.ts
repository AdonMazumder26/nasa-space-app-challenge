import type { Artifact, CatalogImage, Localized, Mission, ObjectStatus, PlanetId, Source, TimelineEvent } from "../types/catalog";
import type { ArtifactModel } from "../data/artifactModels";
import type { StoryImage } from "../data/storyImages";

/**
 * Story Mode describes presentation order and narrative framing only.
 * Every mission, artifact, image, source, and model it shows is resolved from the
 * existing catalog at render time; nothing historical is duplicated here.
 */

export type StoryTheme = "intro" | "moon" | "transition" | "mars" | "remains" | "legacy";

export type MissionLayout = "cinematic" | "split" | "split-reverse" | "editorial" | "date";

/**
 * How a piece of hardware relates to the end of its mission. These are narrative
 * categories, and `validateStoryChapters` checks each against the catalog status.
 */
export type RemainCategory = "left" | "stranded" | "ended" | "active";

export type StoryStatus = "active" | "ended" | "lost" | "unconfirmed";

export type HeroSection = {
  id: string;
  type: "hero";
  kicker: Localized;
  title: Localized;
  paragraphs: Localized[];
  question: Localized;
};

export type NarrativeSection = {
  id: string;
  type: "narrative";
  kicker?: Localized;
  heading?: Localized;
  paragraphs: Localized[];
  quote?: Localized;
  /** Shows live counts computed from the missions and artifacts in the story. */
  stats?: boolean;
  /** Renders the paragraphs as one large statement whose words light up as the reader scrolls. */
  highlight?: boolean;
};

/** A pinned scene: photographs fly in from every edge and settle around a central statement. */
export type AssemblySection = {
  id: string;
  type: "assembly";
  kicker?: Localized;
  title: Localized;
  body?: Localized;
  /** Ids from storyImages. Four to six work best. */
  imageIds: string[];
};

/** The closing choice: two worlds, two doors into the interactive atlas. */
export type FinaleSection = {
  id: string;
  type: "finale";
  kicker: Localized;
  title: Localized;
  body: Localized;
  moonImageId: string;
  marsImageId: string;
};

export type MissionSection = {
  id: string;
  type: "mission";
  missionId: string;
  layout: MissionLayout;
  /** Catalog artifacts belonging to this mission that the section should surface. */
  artifactIds: string[];
  /** The artifact whose first photograph leads the section. Optional; sections degrade without it. */
  imageArtifactId?: string;
  /** Hall of Relics scan associated with one of `artifactIds`. Linked, never loaded here. */
  relicModelId?: string;
  lead: Localized;
  showTimeline?: boolean;
};

export type TimelineSection = {
  id: string;
  type: "timeline";
  heading: Localized;
  intro?: Localized;
  missionIds: string[];
};

export type GallerySection = {
  id: string;
  type: "gallery";
  heading: Localized;
  intro?: Localized;
  artifactIds: string[];
  /** "strip" pins the section on desktop and pans the photographs sideways as the reader scrolls. */
  layout?: "grid" | "strip";
};

export type HardwareGroup = {
  category?: RemainCategory;
  artifactIds: string[];
};

export type HardwareSection = {
  id: string;
  type: "hardware";
  heading: Localized;
  intro?: Localized;
  groups: HardwareGroup[];
};

export type TransitionSection = {
  id: string;
  type: "transition";
  kicker: Localized;
  title: Localized;
  paragraphs: Localized[];
  from: PlanetId;
  to: PlanetId;
  /** Optional storyImages id shown as a small floating print beside the text. */
  imageId?: string;
  imageCaption?: Localized;
};

export type ConclusionSection = {
  id: string;
  type: "conclusion";
  title: Localized;
  paragraphs: Localized[];
};

export type ResourcesSection = {
  id: string;
  type: "resources";
};

export type StorySection =
  | HeroSection
  | NarrativeSection
  | AssemblySection
  | MissionSection
  | TimelineSection
  | GallerySection
  | HardwareSection
  | TransitionSection
  | ConclusionSection
  | ResourcesSection
  | FinaleSection;

export type StoryChapter = {
  id: string;
  theme: StoryTheme;
  title: Localized;
  subtitle: Localized;
  sections: StorySection[];
};

export type StoryCatalog = {
  missions: Mission[];
  objects: Artifact[];
  sources: Source[];
  events: TimelineEvent[];
  models: ArtifactModel[];
  images: StoryImage[];
};

export const NASA_AGENCY = "NASA";

/** Collapses the catalog's status vocabulary into the four labels Story Mode uses. */
export function storyStatusFor(status: ObjectStatus): StoryStatus {
  switch (status) {
    case "active":
      return "active";
    case "mission_complete":
    case "inactive":
      return "ended";
    case "communication_lost":
    case "destroyed":
    case "impacted":
      return "lost";
    default:
      return "unconfirmed";
  }
}

/** The catalog statuses under which each narrative category is an honest description. */
const categoryStatuses: Record<RemainCategory, ObjectStatus[]> = {
  left: ["mission_complete", "inactive"],
  stranded: ["communication_lost"],
  ended: ["mission_complete", "inactive"],
  active: ["active"],
};

export function categoryAllowsStatus(category: RemainCategory, status: ObjectStatus): boolean {
  return categoryStatuses[category].includes(status);
}

export function exploreHref(artifact: Pick<Artifact, "planet" | "id">): string {
  return `/explore/${artifact.planet}?object=${encodeURIComponent(artifact.id)}`;
}

export function relicHref(model: Pick<ArtifactModel, "id">): string {
  return `/relics?model=${encodeURIComponent(model.id)}`;
}

export function missionsInStory(chapters: StoryChapter[]): string[] {
  const ids = new Set<string>();
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      if (section.type === "mission") ids.add(section.missionId);
      if (section.type === "timeline") section.missionIds.forEach((id) => ids.add(id));
    }
  }
  return [...ids];
}

export function artifactsInStory(chapters: StoryChapter[]): string[] {
  const ids = new Set<string>();
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      if (section.type === "mission" || section.type === "gallery") section.artifactIds.forEach((id) => ids.add(id));
      if (section.type === "hardware") section.groups.forEach((group) => group.artifactIds.forEach((id) => ids.add(id)));
    }
  }
  return [...ids];
}

export function firstImageFor(artifact: Artifact | undefined): CatalogImage | null {
  return artifact?.images[0] ?? null;
}

export function sourcesFor(ids: string[], sources: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const source = sources.find((item) => item.id === id);
    if (source) {
      seen.add(id);
      out.push(source);
    }
  }
  return out;
}

/* ---------------------------------------------------------------------------------- */
/* Resolution: turn id references into catalog records for the components to render.  */

export type ResolvedMissionSection = {
  section: MissionSection;
  mission: Mission;
  artifacts: Artifact[];
  image: CatalogImage | null;
  events: TimelineEvent[];
  sources: Source[];
  relic: ArtifactModel | null;
};

export type ResolvedHardwareItem = {
  artifact: Artifact;
  mission: Mission | undefined;
  sources: Source[];
  relic: ArtifactModel | null;
};

export type ResolvedHardwareGroup = {
  category?: RemainCategory;
  items: ResolvedHardwareItem[];
};

function sortByDate(events: TimelineEvent[]): TimelineEvent[] {
  return events.slice().sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/** The first non-provisional scan associated with any of the artifacts, if one exists. */
export function relicForArtifacts(artifactIds: string[], models: ArtifactModel[], preferredId?: string): ArtifactModel | null {
  if (preferredId) {
    const preferred = models.find((model) => model.id === preferredId);
    if (preferred) return preferred;
  }
  return models.find((model) => !model.provisional && model.objectIds.some((id) => artifactIds.includes(id))) ?? null;
}

export function resolveMissionSection(section: MissionSection, catalog: StoryCatalog): ResolvedMissionSection | null {
  const mission = catalog.missions.find((item) => item.id === section.missionId);
  if (!mission || mission.agency !== NASA_AGENCY) return null;
  const artifacts = section.artifactIds
    .map((id) => catalog.objects.find((object) => object.id === id))
    .filter((object): object is Artifact => Boolean(object && object.missionId === mission.id));
  const imageArtifact = section.imageArtifactId ? artifacts.find((object) => object.id === section.imageArtifactId) : undefined;
  const events = section.showTimeline ? sortByDate(catalog.events.filter((event) => event.missionId === mission.id)) : [];
  const sourceIds = [...mission.sources, ...artifacts.flatMap((object) => object.sources)];
  return {
    section,
    mission,
    artifacts,
    image: firstImageFor(imageArtifact),
    events,
    sources: sourcesFor(sourceIds, catalog.sources),
    relic: section.relicModelId ? relicForArtifacts(section.artifactIds, catalog.models, section.relicModelId) : null,
  };
}

export function resolveHardwareGroups(section: HardwareSection, catalog: StoryCatalog): ResolvedHardwareGroup[] {
  return section.groups
    .map((group) => ({
      category: group.category,
      items: group.artifactIds.flatMap((id): ResolvedHardwareItem[] => {
        const artifact = catalog.objects.find((object) => object.id === id);
        if (!artifact) return [];
        if (group.category && !categoryAllowsStatus(group.category, artifact.status)) return [];
        const mission = catalog.missions.find((item) => item.id === artifact.missionId);
        if (mission && mission.agency !== NASA_AGENCY) return [];
        return [
          {
            artifact,
            mission,
            sources: sourcesFor([artifact.location.sourceId, ...artifact.sources], catalog.sources),
            relic: relicForArtifacts([artifact.id], catalog.models),
          },
        ];
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function resolveTimelineEvents(missionIds: string[], catalog: StoryCatalog): TimelineEvent[] {
  const ids = new Set(missionIds);
  return sortByDate(catalog.events.filter((event) => ids.has(event.missionId)));
}

export function resolveGalleryItems(section: GallerySection, catalog: StoryCatalog): { artifact: Artifact; mission: Mission | undefined }[] {
  return section.artifactIds.flatMap((id) => {
    const artifact = catalog.objects.find((object) => object.id === id);
    if (!artifact || artifact.images.length === 0) return [];
    return [{ artifact, mission: catalog.missions.find((item) => item.id === artifact.missionId) }];
  });
}

/** Surface-level checks so a bad id fails loudly in development instead of rendering a half-empty section. */
export function validateStoryChapters(chapters: StoryChapter[], catalog: StoryCatalog): string[] {
  const issues: string[] = [];
  const missions = new Map(catalog.missions.map((mission) => [mission.id, mission]));
  const objects = new Map(catalog.objects.map((object) => [object.id, object]));
  const models = new Map(catalog.models.map((model) => [model.id, model]));
  const images = new Set(catalog.images.map((image) => image.id));
  const chapterIds = new Set<string>();
  const sectionIds = new Set<string>();

  const requireImage = (id: string, where: string) => {
    if (!images.has(id)) issues.push(`${where}: unknown story image "${id}"`);
  };

  const requireNasaMission = (id: string, where: string): Mission | undefined => {
    const mission = missions.get(id);
    if (!mission) {
      issues.push(`${where}: unknown mission "${id}"`);
      return undefined;
    }
    if (mission.agency !== NASA_AGENCY) issues.push(`${where}: mission "${id}" is ${mission.agency}, not NASA`);
    return mission;
  };

  const requireArtifact = (id: string, where: string): Artifact | undefined => {
    const object = objects.get(id);
    if (!object) {
      issues.push(`${where}: unknown artifact "${id}"`);
      return undefined;
    }
    const mission = missions.get(object.missionId);
    if (mission && mission.agency !== NASA_AGENCY) issues.push(`${where}: artifact "${id}" belongs to a non-NASA mission`);
    return object;
  };

  let moonIndex = -1;
  let marsIndex = -1;

  chapters.forEach((chapter, index) => {
    if (chapterIds.has(chapter.id)) issues.push(`duplicate chapter id "${chapter.id}"`);
    chapterIds.add(chapter.id);
    if (chapter.theme === "moon" && moonIndex < 0) moonIndex = index;
    if (chapter.theme === "mars" && marsIndex < 0) marsIndex = index;
    if (chapter.sections.length === 0) issues.push(`chapter "${chapter.id}" has no sections`);

    for (const section of chapter.sections) {
      const where = `${chapter.id}/${section.id}`;
      if (sectionIds.has(section.id)) issues.push(`duplicate section id "${section.id}"`);
      sectionIds.add(section.id);

      switch (section.type) {
        case "mission": {
          const mission = requireNasaMission(section.missionId, where);
          if (section.artifactIds.length === 0) issues.push(`${where}: mission section lists no artifacts`);
          for (const id of section.artifactIds) {
            const object = requireArtifact(id, where);
            if (object && mission && object.missionId !== mission.id) issues.push(`${where}: artifact "${id}" is not part of ${mission.id}`);
          }
          if (section.imageArtifactId) {
            const object = objects.get(section.imageArtifactId);
            if (!object) issues.push(`${where}: image artifact "${section.imageArtifactId}" does not exist`);
            else if (object.images.length === 0) issues.push(`${where}: image artifact "${section.imageArtifactId}" has no photograph`);
            else if (!section.artifactIds.includes(section.imageArtifactId)) issues.push(`${where}: image artifact must be listed in artifactIds`);
          }
          if (section.relicModelId) {
            const model = models.get(section.relicModelId);
            if (!model) issues.push(`${where}: relic model "${section.relicModelId}" does not exist`);
            else if (!model.objectIds.some((id) => section.artifactIds.includes(id))) issues.push(`${where}: relic model "${section.relicModelId}" is not associated with the listed artifacts`);
          }
          break;
        }
        case "timeline":
          if (section.missionIds.length === 0) issues.push(`${where}: timeline lists no missions`);
          section.missionIds.forEach((id) => requireNasaMission(id, where));
          break;
        case "gallery":
          for (const id of section.artifactIds) {
            const object = requireArtifact(id, where);
            if (object && object.images.length === 0) issues.push(`${where}: gallery artifact "${id}" has no photograph`);
          }
          break;
        case "hardware":
          if (section.groups.length === 0) issues.push(`${where}: hardware section has no groups`);
          for (const group of section.groups) {
            for (const id of group.artifactIds) {
              const object = requireArtifact(id, where);
              if (object && group.category && !categoryAllowsStatus(group.category, object.status)) {
                issues.push(`${where}: "${id}" is ${object.status}, which does not support the "${group.category}" category`);
              }
            }
          }
          break;
        case "transition":
          if (section.from === section.to) issues.push(`${where}: transition must move between two worlds`);
          if (section.imageId) requireImage(section.imageId, where);
          break;
        case "assembly":
          if (section.imageIds.length < 3) issues.push(`${where}: assembly needs at least three images`);
          section.imageIds.forEach((id) => requireImage(id, where));
          break;
        case "finale":
          requireImage(section.moonImageId, where);
          requireImage(section.marsImageId, where);
          break;
        default:
          break;
      }
    }
  });

  if (moonIndex < 0) issues.push("no Moon chapter");
  if (marsIndex < 0) issues.push("no Mars chapter");
  if (moonIndex >= 0 && marsIndex >= 0 && moonIndex > marsIndex) issues.push("the Moon chapter must come before Mars");

  return issues;
}
