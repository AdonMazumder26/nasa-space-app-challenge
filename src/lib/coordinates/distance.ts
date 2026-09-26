import type { PlanetId } from "../../types/catalog";

/** Mean radii used only to turn two catalog coordinates into a surface distance. */
const RADIUS_KM: Record<PlanetId, number> = {
  moon: 1737.4,
  mars: 3389.5,
};

export function surfaceDistanceKm(planet: PlanetId, lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = RADIUS_KM[planet];
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function formatDistanceKm(km: number, lang: "en" | "bn", unit: string): string {
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  const digits = km < 10 ? 2 : km < 100 ? 1 : 0;
  const value = digits === 0 ? Math.round(km) : km;
  const formatted = value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return `${formatted} ${unit}`;
}
