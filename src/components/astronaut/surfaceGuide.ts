import * as THREE from "three";
import { latLonToVector, PLANET_RADIUS } from "../../lib/coordinates/latLon";

/** Metres in globe units. The marker sits on the site; the guide stops short of it. */
export const STAND_OFFSET = 0.11;
export const APPROACH_OFFSET = 0.2;
export const APPROACH_SECONDS = 2.6;

export type GuideFrame = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
};

/**
 * Place a figure on the existing geographic surface, offset east of the site.
 * Local +Y is the surface normal. Local +Z points back toward the marker.
 */
export function guideFrame(latitude: number, longitude: number, eastOffset: number): GuideFrame {
  const stand = latLonToVector(latitude, longitude, PLANET_RADIUS + 0.008);
  const normal = new THREE.Vector3(stand.x, stand.y, stand.z).normalize();
  const east = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal);
  if (east.lengthSq() < 1e-8) east.set(1, 0, 0);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();
  const towardMarker = east.clone().multiplyScalar(-1);
  const right = north.clone().negate();
  const position = new THREE.Vector3(stand.x, stand.y, stand.z).addScaledVector(east, eastOffset);
  const basis = new THREE.Matrix4().makeBasis(right, normal, towardMarker);
  return { position, quaternion: new THREE.Quaternion().setFromRotationMatrix(basis) };
}
