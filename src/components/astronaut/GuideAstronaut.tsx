import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Component, Suspense, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Astronaut } from "./Astronaut";
import { ASTRONAUT_CLIPS, type AstronautPose } from "./clips";
import { APPROACH_OFFSET, APPROACH_SECONDS, guideFrame, STAND_OFFSET } from "./surfaceGuide";

type Props = {
  latitude: number;
  longitude: number;
  reducedMotion: boolean;
};

/** Set false to hide the development readout. */
const SHOW_ASTRONAUT_DEBUG = false;

type MoveState = "approaching" | "waving" | "pointing" | "idle";

class AstronautBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The guide stays on the spinning planet, the same parent as the markers, so a site click
 * and the astronaut share one lat/lon conversion. A walk across the whole globe is not a
 * published traverse, so each new site starts a short approach beside that marker.
 * The camera is left to the existing site flight.
 */
export function GuideAstronaut(props: Props) {
  return (
    <AstronautBoundary>
      <Suspense fallback={null}>
        <GuideBody {...props} />
      </Suspense>
    </AstronautBoundary>
  );
}

function GuideBody({ latitude, longitude, reducedMotion }: Props) {
  const root = useRef<THREE.Group>(null);
  const from = useRef(guideFrame(latitude, longitude, APPROACH_OFFSET));
  const to = useRef(guideFrame(latitude, longitude, STAND_OFFSET));
  const progress = useRef(reducedMotion ? 1 : 0);
  const [move, setMove] = useState<MoveState>(reducedMotion ? "idle" : "approaching");
  const pose: AstronautPose = move === "approaching" ? "walk" : move === "waving" ? "wave" : move === "pointing" ? "point" : "idle";

  useLayoutEffect(() => {
    const start = guideFrame(latitude, longitude, reducedMotion ? STAND_OFFSET : APPROACH_OFFSET);
    const goal = guideFrame(latitude, longitude, STAND_OFFSET);
    from.current = start;
    to.current = goal;
    progress.current = reducedMotion ? 1 : 0;
    setMove(reducedMotion ? "idle" : "approaching");
    root.current?.position.copy(start.position);
    root.current?.quaternion.copy(start.quaternion);
  }, [latitude, longitude, reducedMotion]);

  useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / APPROACH_SECONDS);
      if (progress.current === 1) setMove(reducedMotion ? "idle" : "waving");
    }
    const t = progress.current;
    const eased = t * t * (3 - 2 * t);
    group.position.lerpVectors(from.current.position, to.current.position, eased);
    group.quaternion.slerpQuaternions(from.current.quaternion, to.current.quaternion, eased);
  });

  return (
    <group ref={root}>
      <Astronaut
        pose={reducedMotion ? "idle" : pose}
        reducedMotion={reducedMotion}
        onPoseFinished={(finished) => {
          if (finished === "wave") setMove("pointing");
          if (finished === "point") setMove("idle");
        }}
      />
      {SHOW_ASTRONAUT_DEBUG && (
        <Html position={[0, 0.16, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
          <pre className="rounded-xl bg-[#070d1c]/90 px-2 py-1 text-[10px] leading-4 text-[#f4f7ff]">
            {`clips: ${Object.values(ASTRONAUT_CLIPS).join(", ")}
current: ${pose}
move: ${move}
lat ${latitude.toFixed(3)} lon ${longitude.toFixed(3)}`}
          </pre>
        </Html>
      )}
    </group>
  );
}
