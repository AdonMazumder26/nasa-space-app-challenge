import type { ObjectType } from "../types/catalog";

export const typeColor: Record<ObjectType, string> = {
  descent_stage: "#e2c57a",
  rover: "#8fd0ea",
  lander: "#e07a5f",
  instrument: "#9dceb0",
  experiment: "#cbb6f5",
  spacecraft_component: "#f0b3d0",
  impact_hardware: "#f07167",
  other: "#d5d5d5",
};

export function recordedSpanDays(arrival?: string, end?: string): number | null {
  if (!arrival || !end) return null;
  const start = Date.parse(`${arrival}T00:00:00Z`);
  const stop = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(stop) || stop < start) return null;
  return Math.round((stop - start) / 86_400_000);
}

export function formatDisplayDate(iso: string, lang: "en" | "bn"): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
