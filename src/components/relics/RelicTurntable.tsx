import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { RelicModel, type RelicPhase } from "./RelicModel";

type Props = {
  url: string;
  reducedMotion: boolean;
  /** Radians per second. */
  spin?: number;
  bob?: boolean;
  fit?: number;
  distance?: number;
  className?: string;
  /** Drive the materialise sweep from outside; defaults to a one-off "in". */
  phase?: RelicPhase;
  onReady?: () => void;
  onGone?: () => void;
};

/** A transparent, control-free viewer for embedding a relic inside normal page layout. */
export function RelicTurntable({ url, reducedMotion, spin = 0.35, bob = true, fit = 2.1, distance = 4.1, className, phase = "in", onReady, onGone }: Props) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0.55, distance], fov: 32 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onCreated={({ camera, gl }) => {
        gl.localClippingEnabled = true;
        camera.lookAt(0, 0, 0);
      }}
      style={{ background: "transparent" }}
    >
      <hemisphereLight args={["#d5e2ff", "#0a1326", 0.7]} />
      <directionalLight position={[3, 4, 4]} intensity={2.8} color="#fff1dc" />
      <directionalLight position={[-4, 1, -3]} intensity={1.5} color="#7fb0ff" />
      <directionalLight position={[0, -2, 4]} intensity={0.45} color="#f2a64a" />
      <Suspense fallback={null}>
        <RelicModel key={url} url={url} fit={fit} phase={phase} reducedMotion={reducedMotion} spin={spin} bob={bob} onReady={onReady} onGone={onGone} />
      </Suspense>
    </Canvas>
  );
}
