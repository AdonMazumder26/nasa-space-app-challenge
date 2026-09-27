import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { authoredClips } from "./authoredClips";
import { ASTRONAUT_CLIPS, ASTRONAUT_URL, poseLoops, type AstronautPose } from "./clips";

type Props = {
  pose?: AstronautPose;
  reducedMotion: boolean;
  onPoseFinished?: (pose: AstronautPose) => void;
};

const MODEL_SCALE = 0.0074;

let clipsLogged = false;

export function Astronaut({ pose = "idle", reducedMotion, onPoseFinished }: Props) {
  const { scene, animations } = useGLTF(ASTRONAUT_URL);
  const model = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);
  const clips = useMemo(() => [...animations, ...authoredClips(model)], [animations, model]);
  const { actions, mixer } = useAnimations(clips, model);
  const playing = useRef<THREE.AnimationAction | null>(null);
  const finish = useRef(onPoseFinished);
  finish.current = onPoseFinished;

  useEffect(() => {
    if (clipsLogged || !import.meta.env.DEV) return;
    clipsLogged = true;
    console.info(
      "Astronaut animation clips:",
      clips.map((clip) => clip.name),
    );
  }, [clips]);

  useEffect(() => {
    const next = actions[ASTRONAUT_CLIPS[pose]];
    if (!next) return;
    const loops = poseLoops(pose);
    next.setLoop(loops ? THREE.LoopRepeat : THREE.LoopOnce, loops ? Infinity : 1);
    next.clampWhenFinished = !loops;
    const previous = playing.current;
    if (previous && previous !== next) {
      next.reset().play();
      previous.crossFadeTo(next, 0.3, false);
    } else {
      next.reset().fadeIn(0.3).play();
    }
    playing.current = next;
  }, [actions, pose]);

  useEffect(() => {
    const onFinished = (event: { action: THREE.AnimationAction }) => {
      const name = event.action.getClip().name;
      const match = (Object.entries(ASTRONAUT_CLIPS) as [AstronautPose, string][]).find(([, clip]) => clip === name);
      if (match && !poseLoops(match[0])) finish.current?.(match[0]);
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer]);

  useEffect(() => {
    mixer.timeScale = reducedMotion ? 0 : 1;
  }, [mixer, reducedMotion]);

  return <primitive object={model} scale={MODEL_SCALE} />;
}

useGLTF.preload(ASTRONAUT_URL);
