/**
 * Latitude/longitude to a Three.js SphereGeometry surface.
 *
 * SphereGeometry maps the center of an equirectangular texture (u = 0.5)
 * to the +X axis. For that layout, longitude 0° / latitude 0° lands on +X,
 * north is +Y, and east-positive longitude steps from +X toward -Z:
 *
 *   x = R · cos(lat) · cos(lon)
 *   y = R · sin(lat)
 *   z = -R · cos(lat) · sin(lon)
 *
 * Stored longitudes are east-positive and wrapped to [-180, 180].
 * TEXTURE_LON_OFFSET_DEG is the single place to rotate the whole set if a
 * replacement texture uses a different prime-meridian alignment.
 */

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export const TEXTURE_LON_OFFSET_DEG = 0;
export const PLANET_RADIUS = 1;
export const MARKER_ALTITUDE = 1.012;

export function latLonToVector(latitudeDeg: number, longitudeDeg: number, radius: number): Vec3 {
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = ((longitudeDeg + TEXTURE_LON_OFFSET_DEG) * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return {
    x: radius * cosLat * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: -radius * cosLat * Math.sin(lon),
  };
}

export function vectorToLatLon(x: number, y: number, z: number): { latitude: number; longitude: number } {
  const radius = Math.hypot(x, y, z) || 1;
  const latitude = (Math.asin(Math.min(1, Math.max(-1, y / radius))) * 180) / Math.PI;
  let longitude = (Math.atan2(-z, x) * 180) / Math.PI - TEXTURE_LON_OFFSET_DEG;
  if (longitude > 180) longitude -= 360;
  if (longitude < -180) longitude += 360;
  return { latitude, longitude };
}

export function formatCoordinate(latitude: number, longitude: number): string {
  const latHem = latitude >= 0 ? "N" : "S";
  const lonHem = longitude >= 0 ? "E" : "W";
  const digits = Math.max(Math.abs(latitude), Math.abs(longitude)) >= 100 ? 2 : 4;
  return `${Math.abs(latitude).toFixed(digits)}° ${latHem}, ${Math.abs(longitude).toFixed(digits)}° ${lonHem}`;
}

export function yearOf(isoDate: string | undefined): number | null {
  if (!isoDate) return null;
  const year = Number(isoDate.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}
