import * as THREE from "three";

/** These clips are built on the rig. They are not tracks inside the GLB. */
export const AUTHORED_CLIPS = {
  walk: "aria|walk",
  wave: "aria|wave",
  point: "aria|point",
} as const;

function hinge(axis: "x" | "z", angle: number) {
  const direction = axis === "x" ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  return new THREE.Quaternion().setFromAxisAngle(direction, angle);
}

function track(bone: THREE.Bone, axis: "x" | "z", times: number[], angles: number[]) {
  const rest = bone.quaternion.clone();
  const values: number[] = [];
  for (const angle of angles) {
    const posed = rest.clone().multiply(hinge(axis, angle));
    values.push(posed.x, posed.y, posed.z, posed.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, values);
}

function findBone(root: THREE.Object3D, name: string) {
  let found: THREE.Bone | null = null;
  root.traverse((obj) => {
    if (found) return;
    const bone = obj as THREE.Bone;
    if (bone.isBone && bone.name === name) found = bone;
  });
  return found;
}

function add(
  tracks: THREE.KeyframeTrack[],
  root: THREE.Object3D,
  name: string,
  axis: "x" | "z",
  times: number[],
  angles: number[],
) {
  const bone = findBone(root, name);
  if (bone) tracks.push(track(bone, axis, times, angles));
}

/** Limb chains run along local Y, so a swing is a local X or Z rotation from the bind pose. */
export function authoredClips(root: THREE.Object3D) {
  const clips: THREE.AnimationClip[] = [];
  const walkTimes = [0, 0.22, 0.44, 0.66, 0.88];
  const walk: THREE.KeyframeTrack[] = [];
  add(walk, root, "leg_1.L_050", "x", walkTimes, [0.5, 0, -0.5, 0, 0.5]);
  add(walk, root, "leg_1.R_054", "x", walkTimes, [-0.5, 0, 0.5, 0, -0.5]);
  add(walk, root, "leg_2.L_00", "x", walkTimes, [0.2, 0.7, 0.2, 0.7, 0.2]);
  add(walk, root, "leg_2.R_055", "x", walkTimes, [0.7, 0.2, 0.7, 0.2, 0.7]);
  add(walk, root, "arm_1.L_07", "x", walkTimes, [-0.4, 0, 0.4, 0, -0.4]);
  add(walk, root, "arm_1.R_026", "x", walkTimes, [0.4, 0, -0.4, 0, 0.4]);
  if (walk.length > 0) clips.push(new THREE.AnimationClip(AUTHORED_CLIPS.walk, 0.88, walk));

  const waveTimes = [0, 0.18, 0.36, 0.54, 0.72, 1.1];
  const wave: THREE.KeyframeTrack[] = [];
  add(wave, root, "arm_1.R_026", "z", waveTimes, [0, -1.15, -1.15, -1.15, -1.15, 0]);
  add(wave, root, "arm_2.R_027", "z", waveTimes, [0, 0.55, -0.35, 0.55, -0.15, 0]);
  if (wave.length > 0) clips.push(new THREE.AnimationClip(AUTHORED_CLIPS.wave, 1.1, wave));

  const pointTimes = [0, 0.3, 0.95, 1.35];
  const point: THREE.KeyframeTrack[] = [];
  add(point, root, "arm_1.R_026", "x", pointTimes, [0, -0.9, -0.9, 0]);
  add(point, root, "arm_2.R_027", "x", pointTimes, [0, -0.35, -0.35, 0]);
  if (point.length > 0) clips.push(new THREE.AnimationClip(AUTHORED_CLIPS.point, 1.35, point));

  return clips;
}
