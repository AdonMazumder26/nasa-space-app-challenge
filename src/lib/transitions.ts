/** Shared timing for presentation handoffs. Camera flights stay in the globe rig. */
export const transitionMs = {
  ui: 280,
  camera: 1650,
  planetHold: 640,
  planetReveal: 280,
} as const;

export type TransitionKind = "planet-entry" | "planet-switch" | "artifact-focus" | "mission-focus" | "expedition-navigation";
