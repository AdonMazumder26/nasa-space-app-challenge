export type PlanetId = "moon" | "mars";

export type ObjectType =
  | "lander"
  | "rover"
  | "instrument"
  | "descent_stage"
  | "spacecraft_component"
  | "impact_hardware"
  | "experiment"
  | "other";

export type ObjectStatus =
  | "active"
  | "inactive"
  | "mission_complete"
  | "communication_lost"
  | "destroyed"
  | "impacted"
  | "unknown";

export type Precision = "exact" | "approximate" | "estimated" | "unknown";

export type Localized = {
  en: string;
  bn: string;
};

export type Story = {
  whatIsIt: string;
  whatHappened: string;
  whyLeft: string;
  whyItMatters: string;
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: string;
  accessedDate: string;
  notes?: string;
};

export type Location = {
  planet: PlanetId;
  latitude: number;
  longitude: number;
  coordinateSystem: string;
  precision: Precision;
  locationName: string;
  region?: string;
  sourceId: string;
};

export type CatalogImage = {
  id: string;
  url: string;
  alt: Localized;
  credit: string;
  sourceId: string;
  type: string;
};

export type Artifact = {
  id: string;
  name: Localized;
  planet: PlanetId;
  type: ObjectType;
  status: ObjectStatus;
  missionId: string;
  location: Location;
  summary: Localized;
  story: { en: Story; bn: Story };
  significance: Localized;
  sources: string[];
  images: CatalogImage[];
};

export type Mission = {
  id: string;
  name: Localized;
  agency: string;
  country: string;
  planet: PlanetId;
  missionType: string;
  launchDate?: string;
  arrivalDate?: string;
  endDate?: string;
  status: ObjectStatus;
  description: Localized;
  objectives: Localized;
  sources: string[];
};

export type RoverPoint = {
  latitude: number;
  longitude: number;
  date?: string;
  sol?: number;
};

export type RoverRoute = {
  roverId: string;
  points: RoverPoint[];
};

export type TimelineEvent = {
  id: string;
  objectId: string;
  missionId: string;
  date: string;
  label: Localized;
  description: Localized;
};

export type Filters = {
  types: ObjectType[];
  statuses: ObjectStatus[];
  missionId: string | null;
  throughYear: number;
};
