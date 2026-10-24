import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type RelicPhase = "in" | "idle" | "out";

type Props = {
  url: string;
  /** Largest dimension after normalisation, in scene units. */
  fit?: number;
  phase?: RelicPhase;
  reducedMotion?: boolean;
  /** Called once the model is on screen (after the materialise sweep, or immediately with reduced motion). */
  onReady?: () => void;
  /** Called when an "out" sweep has finished and the model can be unmounted. */
  onGone?: () => void;
  spin?: number;
  bob?: boolean;
  wireColor?: string;
};

const IN_SECONDS = 2.1;
const OUT_SECONDS = 0.7;
const SWEEP_BAND = 0.18;
// Scanned meshes are dense, so even a faint wireframe reads as a glowing scaffold.
const WIRE_OPACITY = 0.1;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Normalises a glTF scene to fit `fit` units, centred on the origin, and builds a
 * wireframe twin. Solid and wireframe copies are clipped by opposite planes so a
 * single moving constant reveals metal below the sweep line and scaffold above it.
 */
function prepare(scene: THREE.Group, fit: number, wireColor: string) {
  const solid = scene.clone(true);
  const bounds = new THREE.Box3().setFromObject(solid);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  const scale = fit / largest;
  solid.scale.setScalar(scale);
  solid.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const solidPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const wirePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  solid.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const cloned = materials.map((material) => {
      const copy = (material as THREE.Material).clone();
      copy.clippingPlanes = [solidPlane];
      copy.clipShadows = true;
      return copy;
    });
    node.material = Array.isArray(node.material) ? cloned : cloned[0];
    node.castShadow = true;
    node.receiveShadow = true;
  });

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(wireColor),
    wireframe: true,
    transparent: true,
    opacity: WIRE_OPACITY,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    clippingPlanes: [wirePlane],
    toneMapped: false,
  });
  const wire = solid.clone(true);
  wire.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.material = wireMaterial;
      node.castShadow = false;
      node.receiveShadow = false;
    }
  });

  const halfHeight = (size.y * scale) / 2;
  return { solid, wire, solidPlane, wirePlane, wireMaterial, minY: -halfHeight, maxY: halfHeight };
}

export function RelicModel({ url, fit = 2.2, phase = "in", reducedMotion = false, onReady, onGone, spin = 0, bob = false, wireColor = "#6aa4ff" }: Props) {
  const { scene } = useGLTF(url);
  const rig = useMemo(() => prepare(scene, fit, wireColor), [scene, fit, wireColor]);
  const group = useRef<THREE.Group>(null);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const progress = useRef(phase === "in" && !reducedMotion ? 0 : 1);
  const done = useRef(false);
  const readyRef = useRef(onReady);
  const goneRef = useRef(onGone);
  readyRef.current = onReady;
  goneRef.current = onGone;

  useEffect(() => {
    if (phase === "out") done.current = false;
  }, [phase]);

  useEffect(() => {
    if (progress.current >= 1 && phase !== "out") readyRef.current?.();
    return () => {
      rig.wireMaterial.dispose();
    };
  }, [rig, phase]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (phase === "out") {
      progress.current = Math.max(0, progress.current - dt / (reducedMotion ? 0.001 : OUT_SECONDS));
      if (progress.current <= 0 && !done.current) {
        done.current = true;
        goneRef.current?.();
      }
    } else if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt / IN_SECONDS);
      if (progress.current >= 1 && !done.current) {
        done.current = true;
        readyRef.current?.();
      }
    }

    const p = easeInOut(progress.current);
    const span = rig.maxY - rig.minY + SWEEP_BAND * 2;
    const edge = rig.minY - SWEEP_BAND + span * p;
    // Clipping planes live in world space, so follow wherever this group has been placed.
    const baseY = group.current ? group.current.getWorldPosition(worldPosition).y : 0;
    // Solid is visible where y <= edge; wire where y >= edge - band.
    rig.solidPlane.constant = edge + baseY;
    rig.wirePlane.constant = -(edge - SWEEP_BAND + baseY);
    rig.wire.visible = p < 1 || phase === "out";
    rig.wireMaterial.opacity = WIRE_OPACITY * (1 - Math.pow(p, 3)) + (phase === "out" ? WIRE_OPACITY * 0.6 : 0);

    if (!group.current) return;
    if (spin && !reducedMotion) group.current.rotation.y += spin * dt;
    if (bob && !reducedMotion) group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
  });

  return (
    <group ref={group}>
      <primitive object={rig.solid} />
      <primitive object={rig.wire} />
    </group>
  );
}

export function preloadRelic(url: string) {
  useGLTF.preload(url);
}
