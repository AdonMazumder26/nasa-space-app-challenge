/** The GLB clip is idle. Walk, wave, and point are authored on that same skeleton. */
export const ASTRONAUT_CLIPS = {
  idle: "astro_bones|idle_1",
  walk: "aria|walk",
  wave: "aria|wave",
  point: "aria|point",
} as const;

export type AstronautPose = keyof typeof ASTRONAUT_CLIPS;

export const ASTRONAUT_URL = "/models/astronaut.glb";

export function poseLoops(pose: AstronautPose) {
  return pose === "idle" || pose === "walk";
}
