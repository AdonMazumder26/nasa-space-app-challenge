import type { Artifact, Localized, ObjectStatus, ObjectType, PlanetId, Precision, Story } from "../types/catalog";

const moonFrame = "planetocentric Mean Earth/Polar Axis, east-positive longitude";
const marsFrame = "planetocentric, east-positive longitude";

type Fields = {
  id: string;
  name: Localized;
  planet: PlanetId;
  type: ObjectType;
  status: ObjectStatus;
  missionId: string;
  latitude: number;
  longitude: number;
  precision: Precision;
  locationName: string;
  region: string;
  sourceId: string;
  summary: Localized;
  story: { en: Story; bn: Story };
  significance: Localized;
  sources: string[];
};

export function artifact(input: Fields): Artifact {
  return {
    id: input.id,
    name: input.name,
    planet: input.planet,
    type: input.type,
    status: input.status,
    missionId: input.missionId,
    location: {
      planet: input.planet,
      latitude: input.latitude,
      longitude: input.longitude,
      coordinateSystem: input.planet === "moon" ? moonFrame : marsFrame,
      precision: input.precision,
      locationName: input.locationName,
      region: input.region,
      sourceId: input.sourceId,
    },
    summary: input.summary,
    story: input.story,
    significance: input.significance,
    sources: input.sources,
    images: [],
  };
}
