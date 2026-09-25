import { z } from "zod";
import type { Artifact, Mission, Source, TimelineEvent } from "../../types/catalog";

const localized = z.object({ en: z.string().min(1), bn: z.string().min(1) });

const story = z.object({
  whatIsIt: z.string().min(1),
  whatHappened: z.string().min(1),
  whyLeft: z.string().min(1),
  whyItMatters: z.string().min(1),
});

const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  type: z.string().min(1),
  accessedDate: z.string().min(4),
  notes: z.string().optional(),
});

const locationSchema = z.object({
  planet: z.enum(["moon", "mars"]),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  coordinateSystem: z.string().min(1),
  precision: z.enum(["exact", "approximate", "estimated", "unknown"]),
  locationName: z.string().min(1),
  region: z.string().optional(),
  sourceId: z.string().min(1),
});

const artifactSchema = z.object({
  id: z.string().min(1),
  name: localized,
  planet: z.enum(["moon", "mars"]),
  type: z.enum(["lander", "rover", "instrument", "descent_stage", "spacecraft_component", "impact_hardware", "experiment", "other"]),
  status: z.enum(["active", "inactive", "mission_complete", "communication_lost", "destroyed", "impacted", "unknown"]),
  missionId: z.string().min(1),
  location: locationSchema,
  summary: localized,
  story: z.object({ en: story, bn: story }),
  significance: localized,
  sources: z.array(z.string().min(1)).min(1),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: localized,
    credit: z.string(),
    sourceId: z.string(),
    type: z.string(),
  })),
});

const missionSchema = z.object({
  id: z.string().min(1),
  name: localized,
  agency: z.string().min(1),
  country: z.string().min(1),
  planet: z.enum(["moon", "mars"]),
  missionType: z.string().min(1),
  launchDate: z.string().optional(),
  arrivalDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "inactive", "mission_complete", "communication_lost", "destroyed", "impacted", "unknown"]),
  description: localized,
  objectives: localized,
  sources: z.array(z.string().min(1)).min(1),
});

export function validateCatalog(input: {
  sources: Source[];
  missions: Mission[];
  objects: Artifact[];
  events: TimelineEvent[];
}): string[] {
  const issues: string[] = [];
  const sources = z.array(sourceSchema).safeParse(input.sources);
  const missions = z.array(missionSchema).safeParse(input.missions);
  const objects = z.array(artifactSchema).safeParse(input.objects);
  if (!sources.success) issues.push(`sources: ${sources.error.issues.map((issue) => issue.message).join("; ")}`);
  if (!missions.success) issues.push(`missions: ${missions.error.issues.map((issue) => issue.message).join("; ")}`);
  if (!objects.success) issues.push(`objects: ${objects.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);

  const sourceIds = new Set(input.sources.map((source) => source.id));
  const missionIds = new Set(input.missions.map((mission) => mission.id));
  const objectIds = new Set<string>();

  for (const object of input.objects) {
    if (objectIds.has(object.id)) issues.push(`duplicate object id ${object.id}`);
    objectIds.add(object.id);
    if (object.location.planet !== object.planet) issues.push(`${object.id} location planet does not match`);
    const mission = input.missions.find((item) => item.id === object.missionId);
    if (!mission) issues.push(`${object.id} missing mission ${object.missionId}`);
    else if (mission.planet !== object.planet) issues.push(`${object.id} mission planet does not match`);
    if (!sourceIds.has(object.location.sourceId)) issues.push(`${object.id} missing location source`);
    for (const sourceId of object.sources) {
      if (!sourceIds.has(sourceId)) issues.push(`${object.id} missing source ${sourceId}`);
    }
    for (const image of object.images) {
      if (!sourceIds.has(image.sourceId)) issues.push(`${object.id} image ${image.id} missing source ${image.sourceId}`);
      if (!image.alt.en || !image.alt.bn) issues.push(`${object.id} image ${image.id} missing alt text`);
    }
  }

  for (const mission of input.missions) {
    for (const sourceId of mission.sources) {
      if (!sourceIds.has(sourceId)) issues.push(`${mission.id} missing source ${sourceId}`);
    }
  }

  for (const event of input.events) {
    if (!objectIds.has(event.objectId)) issues.push(`${event.id} missing object ${event.objectId}`);
    if (!missionIds.has(event.missionId)) issues.push(`${event.id} missing mission ${event.missionId}`);
    if (!event.date || !event.label.en || !event.label.bn) issues.push(`${event.id} incomplete timeline fields`);
  }

  return issues;
}
