import { OrbitControls, useProgress, useTexture, Html } from "@react-three/drei";
import { GuideAstronaut } from "../astronaut/GuideAstronaut";
import { StarField } from "./StarField";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { roverRoutes } from "../../data/roverRoutes";
import { latLonToVector, vectorToLatLon, MARKER_ALTITUDE } from "../../lib/coordinates/latLon";
import { discoveryAngle, viewLevel, type FlightPhase, type SurfaceView } from "../../lib/exploration";
import { typeColor } from "../../lib/presentation";
import { BRAND } from "../../constants/branding";
import type { Artifact, PlanetId } from "../../types/catalog";

const MIN_DISTANCE = 1.42;
const MAX_DISTANCE = 5.8;
const DEFAULT_OFFSET = new THREE.Vector3(2.72, 0.5, 0.22);
// One viewing turn in about three minutes. This is not a real sidereal day.
const VIEW_TURN = (Math.PI * 2 * 0.32) / 60;

function applySpin(vector: THREE.Vector3, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = vector.x * cos + vector.z * sin;
  const z = -vector.x * sin + vector.z * cos;
  vector.x = x;
  vector.z = z;
  return vector;
}

const textureUrl: Record<PlanetId, string> = {
  moon: "/textures/moon.jpg",
  mars: "/textures/mars.jpg",
};

// Small maps so the globe appears immediately; the 8K map replaces them once it arrives.
const previewUrl: Record<PlanetId, string> = {
  moon: "/textures/moon-preview.jpg",
  mars: "/textures/mars-preview.jpg",
};

useTexture.preload(previewUrl.moon);
useTexture.preload(previewUrl.mars);

export type SceneHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

type SceneProps = {
  planet: PlanetId;
  objects: Artifact[];
  selectedId: string | null;
  previewedId?: string | null;
  focusNonce: number;
  emphasisNonce: number;
  intro: boolean;
  introDelay?: number;
  introReady?: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  errorMessage: string;
  loadingLabel: string;
  onSurfaceReady?: () => void;
  surfaceError: string;
  retryLabel: string;
  clusterHint: string;
  clickHint?: string;
  labelFor: (object: Artifact) => string;
  onSelect: (id: string) => void;
  onEmptyClick: () => void;
  sceneRef: { current: SceneHandle | null };
  discovery?: boolean;
  discoveredIds?: readonly string[];
  onDiscover?: (ids: string[]) => void;
  captionFor?: (object: Artifact) => { type: string; place: string; year: string };
  onView?: (view: SurfaceView) => void;
  onFlight?: (phase: FlightPhase) => void;
  missionIds?: readonly string[];
  // Moves the site left and up so the story panel and bottom bar do not cover it.
  siteFrame?: { right: number; up: number };
  textureAttempt?: number;
  onTextureFail?: () => void;
  guideSite?: { latitude: number; longitude: number; attentive?: boolean } | null;
};

class WebglBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

// Shown when the globe cannot be drawn. The catalog stays usable without WebGL.
function PlainList({
  objects,
  message,
  labelFor,
  onSelect,
}: {
  objects: Artifact[];
  message: string;
  labelFor: (object: Artifact) => string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <p className="max-w-prose rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-[#f4f7ff]">{message}</p>
      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {objects.map((object) => (
          <li key={object.id}>
            <button
              type="button"
              onClick={() => onSelect(object.id)}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#070d1c]/80 px-3 py-2 text-left text-sm text-[#f4f7ff] hover:border-white/25"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: typeColor[object.type] }} />
              <span className="truncate">{labelFor(object)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

class TextureBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFail?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function FallbackSphere({ planet }: { planet: PlanetId }) {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color={planet === "moon" ? "#c8c3b8" : "#a3543c"} roughness={0.9} />
    </mesh>
  );
}

function TexturedPlanet({ planet }: { planet: PlanetId }) {
  const preview = useTexture(previewUrl[planet]);
  preview.colorSpace = THREE.SRGBColorSpace;
  preview.anisotropy = 16;
  const [full, setFull] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    setFull(null);
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(textureUrl[planet], (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      if (cancelled) {
        texture.dispose();
        return;
      }
      loaded = texture;
      setFull(texture);
    });
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [planet]);

  const map = full ?? preview;
  return (
    <mesh>
      <sphereGeometry args={[1, 96, 96]} />
      <meshStandardMaterial
        map={map}
        bumpMap={map}
        bumpScale={planet === "moon" ? 0.02 : 0.014}
        roughness={planet === "moon" ? 0.94 : 0.86}
        metalness={0.02}
      />
    </mesh>
  );
}

function MarsAir() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { glow: { value: new THREE.Color("#e07a5f") } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vWorld;
          uniform vec3 glow;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 1.7);
            gl_FragColor = vec4(glow, fresnel * 0.38);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <>
      <mesh scale={1.045} material={material}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
      <mesh scale={1.11}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial color="#c46a52" transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

function Lights({ planet }: { planet: PlanetId }) {
  return (
    <>
      <ambientLight intensity={planet === "moon" ? 0.028 : 0.07} />
      <directionalLight position={[4.5, 2.2, 1.4]} intensity={planet === "moon" ? 2.7 : 1.9} color={planet === "moon" ? "#f7f3ea" : "#ffd2b8"} />
      <directionalLight position={[-3.5, -1.2, -2]} intensity={planet === "moon" ? 0.045 : 0.08} color="#9eb4cc" />
    </>
  );
}

function CameraFill({ enabled }: { enabled: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();
  useFrame(() => {
    light.current?.position.copy(camera.position);
  });
  return <directionalLight ref={light} intensity={enabled ? 1.35 : 0} color="#f7f3ea" />;
}

type FocusAnim = { from: THREE.Vector3; to: THREE.Vector3; started: number; selected: boolean };

const FLIGHT_MS = 1650;

function CameraRig({
  sceneRef,
  planet,
  selected,
  focusNonce,
  clusterFocus,
  intro,
  introDelay = 0,
  introReady = true,
  autoRotate,
  reducedMotion,
  skipEmpty,
  spinAngle,
  spinGate,
  onEmptyClick,
  onFlight,
  siteFrame,
}: {
  sceneRef: { current: SceneHandle | null };
  planet: PlanetId;
  selected: Artifact | null;
  focusNonce: number;
  clusterFocus?: { position: THREE.Vector3; nonce: number } | null;
  intro: boolean;
  introDelay?: number;
  introReady?: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  skipEmpty: { current: boolean };
  spinAngle: { current: number };
  spinGate: { current: boolean };
  onEmptyClick: () => void;
  onFlight?: (phase: FlightPhase) => void;
  siteFrame: { right: number; up: number };
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const controls = useRef<OrbitControlsImpl>(null);
  const focus = useRef<FocusAnim | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const onFlightRef = useRef(onFlight);
  onFlightRef.current = onFlight;
  const phase = useRef<FlightPhase>("idle");
  const setPhase = (next: FlightPhase) => {
    if (phase.current === next) return;
    phase.current = next;
    onFlightRef.current?.(next);
  };
  const flightScratch = useRef({
    fromDir: new THREE.Vector3(),
    toDir: new THREE.Vector3(),
    turn: new THREE.Quaternion(),
    spin: new THREE.Quaternion(),
  });
  const idle = useRef<number | null>(null);
  spinGate.current = autoRotate && !reducedMotion && !interacting && !selected && !clusterFocus && (intro || !focusing);

  const applyDistance = (nextDistance: number) => {
    const distance = camera.position.length() || 1;
    const clamped = THREE.MathUtils.clamp(nextDistance, MIN_DISTANCE, MAX_DISTANCE);
    camera.position.multiplyScalar(clamped / distance);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
  };

  useEffect(() => {
    const reset = () => {
      focus.current = null;
      setFocusing(false);
      camera.position.copy(DEFAULT_OFFSET);
      controls.current?.target.set(0, 0, 0);
      controls.current?.update();
    };
    sceneRef.current = {
      zoomIn: () => applyDistance(camera.position.length() * 0.82),
      zoomOut: () => applyDistance(camera.position.length() * 1.22),
      reset,
    };
    return () => {
      sceneRef.current = null;
    };
  });

  useLayoutEffect(() => {
    const home = DEFAULT_OFFSET.clone();
    controls.current?.target.set(0, 0, 0);
    if (intro && !reducedMotion) {
      const from = home.clone().multiplyScalar(1.62);
      camera.position.copy(from);
      controls.current?.update();
      if (!introReady) return;
      const timer = window.setTimeout(() => {
        focus.current = { from, to: home, started: performance.now(), selected: false };
        setFocusing(true);
      }, introDelay);
      return () => window.clearTimeout(timer);
    }
    focus.current = null;
    setFocusing(false);
    camera.position.copy(home);
    controls.current?.update();
  }, [planet, camera, intro, introDelay, introReady, reducedMotion]);

  useLayoutEffect(() => {
    const home = DEFAULT_OFFSET.clone();
    if (!selected && !clusterFocus) {
      if (intro) return;
      if (camera.position.distanceTo(home) < 0.08) return;
      if (reducedMotion) {
        camera.position.copy(home);
        controls.current?.target.set(0, 0, 0);
        controls.current?.update();
        setPhase("idle");
        return;
      }
      focus.current = { from: camera.position.clone(), to: home, started: performance.now(), selected: false };
      setFocusing(true);
      return;
    }
    const targetVector = selected
      ? latLonToVector(selected.location.latitude, selected.location.longitude, 1)
      : clusterFocus!.position.clone().normalize();
    const length = Math.hypot(targetVector.x, targetVector.y, targetVector.z) || 1;
    const radial = applySpin(new THREE.Vector3(targetVector.x, targetVector.y, targetVector.z).multiplyScalar(1 / length), spinAngle.current);
    const distance = selected ? 1.5 : 1.6;
    const worldUp = new THREE.Vector3(0, 1, 0);
    const screenUp = worldUp.clone().sub(radial.clone().multiplyScalar(worldUp.dot(radial)));
    if (screenUp.lengthSq() < 1e-4) screenUp.set(1, 0, 0);
    screenUp.normalize();
    const screenRight = new THREE.Vector3().crossVectors(radial, screenUp).normalize();
    // Moving the camera right or down puts the site left or up, in the open part of the screen.
    const to = radial
      .multiplyScalar(distance)
      .addScaledVector(screenRight, distance * siteFrame.right)
      .addScaledVector(screenUp, distance * -siteFrame.up);
    if (reducedMotion) {
      camera.position.copy(to);
      controls.current?.target.set(0, 0, 0);
      controls.current?.update();
      setPhase("idle");
      return;
    }
    focus.current = { from: camera.position.clone(), to, started: performance.now(), selected: true };
    setFocusing(true);
  }, [selected, focusNonce, clusterFocus?.nonce, reducedMotion, camera, intro, spinAngle, siteFrame.right, siteFrame.up]);

  const emptyClick = useRef(onEmptyClick);
  emptyClick.current = onEmptyClick;

  useEffect(() => {
    const cancel = () => {
      if (!focus.current) return;
      focus.current = null;
      setFocusing(false);
      setPhase("idle");
    };
    let originX = 0;
    let originY = 0;
    let dragged = false;
    const down = (event: PointerEvent) => {
      originX = event.clientX;
      originY = event.clientY;
      dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - originX, event.clientY - originY) > 8) {
        dragged = true;
        cancel();
      }
    };
    const up = () => {
      const skip = skipEmpty.current;
      skipEmpty.current = false;
      if (!dragged && !skip) emptyClick.current();
    };
    gl.domElement.addEventListener("pointerdown", down);
    gl.domElement.addEventListener("pointermove", move);
    gl.domElement.addEventListener("pointerup", up);
    return () => {
      gl.domElement.removeEventListener("pointerdown", down);
      gl.domElement.removeEventListener("pointermove", move);
      gl.domElement.removeEventListener("pointerup", up);
    };
  }, [gl, skipEmpty]);

  useFrame(() => {
    const anim = focus.current;
    if (!anim || !controls.current) return;
    const t = Math.min(1, (performance.now() - anim.started) / FLIGHT_MS);
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    const fromLen = anim.from.length() || 1;
    const toLen = anim.to.length() || 1;
    const { fromDir, toDir, turn, spin } = flightScratch.current;
    fromDir.copy(anim.from).multiplyScalar(1 / fromLen);
    toDir.copy(anim.to).multiplyScalar(1 / toLen);
    if (fromDir.dot(toDir) > 0.9995) {
      camera.position.lerpVectors(anim.from, anim.to, eased);
    } else {
      turn.setFromUnitVectors(fromDir, toDir);
      spin.identity().slerp(turn, eased);
      camera.position.copy(fromDir.applyQuaternion(spin)).multiplyScalar(THREE.MathUtils.lerp(fromLen, toLen, eased));
    }
    controls.current.target.set(0, 0, 0);
    controls.current.update();
    if (t >= 1) {
      focus.current = null;
      queueMicrotask(() => {
        setFocusing(false);
        setPhase("idle");
      });
      return;
    }
    if (anim.selected) {
      const next: FlightPhase = t < 0.68 ? "locating" : "acquired";
      queueMicrotask(() => setPhase(next));
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={!focusing}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={0.16}
      maxPolarAngle={Math.PI - 0.16}
      autoRotate={false}
      onStart={() => {
        if (idle.current) window.clearTimeout(idle.current);
        setInteracting(true);
      }}
      onEnd={() => {
        idle.current = window.setTimeout(() => setInteracting(false), reducedMotion ? 0 : 1100);
      }}
    />
  );
}

/** A compact geometric silhouette keeps markers readable and distinct across the planetary surface. */
function BeaconGlyph({ type, color }: { type: Artifact["type"]; color: string }) {
  const GlyphMaterial = () => <meshBasicMaterial color={color} toneMapped={false} />;
  const AccentMaterial = () => <meshBasicMaterial color="#ffffff" transparent opacity={0.88} toneMapped={false} />;

  if (type === "rover") {
    return (
      <group position={[0, 0.46, 0]}>
        {/* Chassis body */}
        <mesh position={[0, 0, 0]} scale={[1.15, 0.36, 0.76]}><GlyphMaterial /><boxGeometry args={[1, 1, 1]} /></mesh>
        {/* Mast & camera head */}
        <mesh position={[0.34, 0.46, 0]} scale={[0.1, 0.62, 0.1]}><GlyphMaterial /><cylinderGeometry args={[1, 1, 1, 8]} /></mesh>
        <mesh position={[0.34, 0.82, 0]} scale={[0.26, 0.18, 0.32]}><AccentMaterial /><boxGeometry args={[1, 1, 1]} /></mesh>
        {/* High-gain dish antenna */}
        <mesh position={[-0.32, 0.42, 0]} rotation={[0.4, 0, 0]} scale={[0.34, 0.08, 0.34]}><GlyphMaterial /><cylinderGeometry args={[1, 1, 1, 12]} /></mesh>
        {/* 4 Corner wheels */}
        {[-0.6, 0.6].map((x) =>
          [-0.42, 0.42].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.26, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.24, 0.16, 0.24]}>
              <GlyphMaterial /><cylinderGeometry args={[1, 1, 1, 10]} />
            </mesh>
          ))
        )}
      </group>
    );
  }

  if (type === "lander") {
    return (
      <group position={[0, 0.45, 0]}>
        {/* Central scientific body */}
        <mesh position={[0, 0.28, 0]} scale={[0.82, 0.36, 0.82]}><GlyphMaterial /><cylinderGeometry args={[0.7, 1, 1, 6]} /></mesh>
        {/* Antenna mast */}
        <mesh position={[0, 0.68, 0]} scale={[0.08, 0.48, 0.08]}><AccentMaterial /><cylinderGeometry args={[1, 1, 1, 8]} /></mesh>
        {/* Solar panel wings */}
        <mesh position={[-0.68, 0.32, 0]} scale={[0.55, 0.05, 0.58]}><GlyphMaterial /><boxGeometry args={[1, 1, 1]} /></mesh>
        <mesh position={[0.68, 0.32, 0]} scale={[0.55, 0.05, 0.58]}><GlyphMaterial /><boxGeometry args={[1, 1, 1]} /></mesh>
        {/* 3 Landing struts */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((rad, i) => (
          <mesh
            key={i}
            position={[Math.cos(rad) * 0.62, -0.15, Math.sin(rad) * 0.62]}
            rotation={[Math.sin(rad) * 0.4, 0, -Math.cos(rad) * 0.4]}
            scale={[0.09, 0.62, 0.09]}
          >
            <GlyphMaterial /><boxGeometry args={[1, 1, 1]} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "descent_stage") {
    return (
      <group position={[0, 0.42, 0]}>
        {/* Octagonal descent stage body */}
        <mesh position={[0, 0.14, 0]} scale={[0.95, 0.45, 0.95]}><GlyphMaterial /><cylinderGeometry args={[1, 1, 1, 8]} /></mesh>
        {/* Descent engine bell nozzle */}
        <mesh position={[0, -0.18, 0]} scale={[0.42, 0.35, 0.42]}><AccentMaterial /><coneGeometry args={[1, 1, 12]} /></mesh>
        {/* 4 Landing struts pads */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rad, i) => (
          <group key={i} rotation={[0, rad, 0]}>
            <mesh position={[0.7, -0.18, 0]} rotation={[0, 0, -0.45]} scale={[0.08, 0.58, 0.08]}>
              <GlyphMaterial /><boxGeometry args={[1, 1, 1]} />
            </mesh>
            <mesh position={[0.92, -0.38, 0]} scale={[0.22, 0.06, 0.22]}>
              <GlyphMaterial /><cylinderGeometry args={[1, 1, 1, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (type === "instrument" || type === "experiment") {
    return (
      <group position={[0, 0.48, 0]}>
        <mesh position={[0, 0, 0]} scale={0.78}><GlyphMaterial /><octahedronGeometry args={[1, 0]} /></mesh>
        <mesh position={[0, 0.64, 0]} scale={[0.07, 0.52, 0.07]}><AccentMaterial /><cylinderGeometry args={[1, 1, 1, 8]} /></mesh>
        <mesh position={[0, 0.94, 0]} scale={0.16}><AccentMaterial /><sphereGeometry args={[1, 10, 10]} /></mesh>
      </group>
    );
  }

  if (type === "impact_hardware") {
    return (
      <group position={[0, 0.4, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} scale={[0.82, 0.95, 0.82]}>
          <GlyphMaterial /><coneGeometry args={[1, 1, 4]} />
        </mesh>
        <mesh position={[0, -0.15, 0]} scale={[1.1, 0.06, 1.1]}>
          <AccentMaterial /><ringGeometry args={[0.5, 1, 16]} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.42, 0]}>
      <mesh scale={[0.78, 0.78, 0.78]}><GlyphMaterial /><boxGeometry args={[1, 1, 1]} /></mesh>
    </group>
  );
}

function statusSignalColor(status: Artifact["status"]): string {
  if (status === "active") return "#6aa4ff";
  if (status === "impacted" || status === "destroyed") return "#f07167";
  if (status === "inactive" || status === "communication_lost") return "#9dceb0";
  return "#f2a64a";
}

function Marker({
  object,
  name,
  caption,
  clickHint,
  selected,
  previewed,
  emphasisNonce,
  revealAt,
  reducedMotion,
  quiet,
  skipEmpty,
  customPosition,
  onSelect,
}: {
  object: Artifact;
  name: string;
  caption: { type: string; place: string; year: string };
  clickHint?: string;
  selected: boolean;
  previewed: boolean;
  emphasisNonce: number;
  revealAt: number;
  reducedMotion: boolean;
  quiet: boolean;
  skipEmpty: { current: boolean };
  customPosition?: THREE.Vector3;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const rippleMat = useRef<THREE.MeshBasicMaterial>(null);
  const signalWave = useRef<THREE.Mesh>(null);
  const signalWaveMat = useRef<THREE.MeshBasicMaterial>(null);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null);
  const restingBeamMat = useRef<THREE.MeshBasicMaterial>(null);
  const scratch = useRef(new THREE.Vector3());
  const burst = useRef(0);
  const [hot, setHot] = useState(false);
  const [labelReady, setLabelReady] = useState(false);
  useEffect(() => setLabelReady(true), []);

  useEffect(() => {
    if (selected && emphasisNonce > 0) burst.current = performance.now();
  }, [selected, emphasisNonce]);
  useEffect(() => {
    if (revealAt > 0) burst.current = revealAt;
  }, [revealAt]);

  const position = useMemo(() => {
    if (customPosition) return customPosition;
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }, [customPosition, object.location.latitude, object.location.longitude]);

  const ringQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()), [position]);
  const beamQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize()), [position]);
  const glyphColor = typeColor[object.type];
  const signalColor = statusSignalColor(object.status);

  useFrame(({ camera, clock }) => {
    const mesh = group.current;
    if (!mesh) return;

    const age = (performance.now() - burst.current) / 700;
    const burstScale = !reducedMotion && age >= 0 && age < 1 ? 1 + Math.sin(age * Math.PI) * 0.35 : 1;
    const distance = camera.position.distanceTo(mesh.getWorldPosition(scratch.current));
    // Maintain crisp angular size from high orbit without shrinking away:
    const scale = THREE.MathUtils.clamp(distance * 0.009, 0.0065, 0.022) * (selected ? 1.3 : previewed ? 1.2 : hot ? 1.15 : 1) * burstScale;
    mesh.scale.setScalar(scale);

    const material = mesh.children[0] && (mesh.children[0] as THREE.Mesh).material;
    if (material && !Array.isArray(material) && "emissiveIntensity" in material) {
      const statusWave = reducedMotion ? 1 : object.status === "communication_lost" || object.status === "inactive" ? 0.72 + Math.sin(clock.elapsedTime * 0.8) * 0.22 : object.status === "impacted" || object.status === "destroyed" ? 0.86 + Math.sin(clock.elapsedTime * 3.6) * 0.16 : object.status === "mission_complete" ? 0.9 + Math.sin(clock.elapsedTime * 1.2) * 0.12 : 1;
      const glow = ((selected || previewed) && !reducedMotion ? 1.8 + Math.sin(clock.elapsedTime * 3.2) * 0.35 : (selected || previewed) ? 2.2 : hot ? 1.6 : 1.25) * statusWave;
      material.emissiveIntensity = quiet && !selected ? glow * 0.28 : glow;
      if ("opacity" in material && "transparent" in material) {
        material.transparent = quiet && !selected;
        material.opacity = quiet && !selected ? 0.35 : 1;
      }
    }

    // Continuous radial signal wave ripple
    if (!reducedMotion && signalWave.current && signalWaveMat.current) {
      const cycle = ((clock.elapsedTime * 0.75 + Math.abs(position.x * 3.5)) % 2.4) / 2.4;
      signalWave.current.scale.setScalar(1 + cycle * 1.6);
      signalWaveMat.current.opacity = (1 - cycle) * (selected ? 0.75 : hot ? 0.55 : 0.38);
    }

    // Reveal ripple animation
    const revealAge = revealAt > 0 ? (performance.now() - revealAt) / 900 : 2;
    const rippling = !reducedMotion && revealAge >= 0 && revealAge < 1;
    if (ripple.current) ripple.current.visible = rippling;
    if (rippleMat.current) rippleMat.current.opacity = rippling ? 0.7 * (1 - revealAge) : 0;
    if (ripple.current && rippling) ripple.current.scale.setScalar(1 + revealAge * 2.2);

    // Selected/focused high-altitude beam
    if (beamMat.current) {
      beamMat.current.opacity = selected ? (reducedMotion ? 0.35 : 0.25 + Math.sin(clock.elapsedTime * 2.4) * 0.1) : 0;
    }

    // Resting telemetry needle
    if (restingBeamMat.current) {
      restingBeamMat.current.opacity = hot ? 0.75 : 0.5;
    }
  });

  return (
    <group position={position}>
      <group ref={group}>
        {/* Ground radar target reticle */}
        <mesh quaternion={ringQuat}>
          <ringGeometry args={[1.05, 1.28, 36]} />
          <meshBasicMaterial color={signalColor} transparent opacity={selected ? 0.9 : hot ? 0.7 : 0.45} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Continuous signal echo wave ("Beyond the Signal") */}
        <mesh ref={signalWave} quaternion={ringQuat}>
          <ringGeometry args={[1.1, 1.34, 36]} />
          <meshBasicMaterial ref={signalWaveMat} color={signalColor} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Surface ground reticle cardinal crosshairs */}
        <group quaternion={ringQuat}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <mesh key={i} rotation={[0, 0, angle]} position={[0, 1.38, 0]}>
              <boxGeometry args={[0.07, 0.26, 0.02]} />
              <meshBasicMaterial color={signalColor} transparent opacity={selected ? 0.9 : hot ? 0.7 : 0.48} depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>

        {/* Vertical beacon anchor pillar grounding the marker to the surface */}
        <group quaternion={beamQuat}>
          <mesh position={[0, hot ? 1.6 : 1.15, 0]}>
            <cylinderGeometry args={[0.025, 0.065, hot ? 3.2 : 2.3, 8, 1, true]} />
            <meshBasicMaterial ref={restingBeamMat} color={signalColor} transparent opacity={0.5} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* Luminous beacon tip star orb with brilliant white core */}
          <mesh position={[0, hot ? 3.25 : 2.35, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, hot ? 3.25 : 2.35, 0]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshBasicMaterial color={signalColor} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>

        {/* Interactive base core sphere */}
        <mesh
          onPointerDown={(event) => {
            event.stopPropagation();
            skipEmpty.current = true;
          }}
          onClick={(event) => {
            event.stopPropagation();
            skipEmpty.current = true;
            onSelect(object.id);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
            setHot(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
            setHot(false);
          }}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={signalColor} emissive={signalColor} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>

        {/* Inner dark contrast core */}
        <mesh scale={0.58}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color="#080e1c" toneMapped={false} />
        </mesh>

        {/* 3D Hardware silhouette glyph */}
        <group quaternion={beamQuat}>
          <BeaconGlyph type={object.type} color={glyphColor} />
        </group>

        {/* High-altitude telemetry beacon beam on selection */}
        {(selected || previewed) && (
          <group quaternion={beamQuat}>
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.16, 0.6, 5.6, 16, 1, true]} />
              <meshBasicMaterial ref={beamMat} color={signalColor} transparent opacity={0.3} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 5.65, 0]}>
              <sphereGeometry args={[0.24, 12, 12]} />
              <meshBasicMaterial color={signalColor} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        )}

        {/* Burst ripple mesh on reveal */}
        <mesh ref={ripple} visible={false} quaternion={ringQuat}>
          <ringGeometry args={[1.35, 1.7, 40]} />
          <meshBasicMaterial ref={rippleMat} color={signalColor} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Selected outer orbit lock ring */}
        {selected && (
          <mesh quaternion={ringQuat}>
            <ringGeometry args={[1.58, 1.9, 48]} />
            <meshBasicMaterial color={signalColor} transparent opacity={0.92} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* Archival Hover Specimen Card */}
      {labelReady && hot && !selected && (
        <Html position={[0, 0.05, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-max max-w-52 rounded-2xl border border-white/20 bg-[#070d1c]/92 p-2.5 text-left shadow-2xl backdrop-blur-xl ring-1 ring-black/40">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: signalColor, boxShadow: `0 0 8px ${signalColor}` }} />
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#f2a64a]">{caption.type || object.type}</span>
            </div>
            <p className="font-display text-sm font-semibold text-[#f4f7ff] uppercase tracking-wide leading-tight">{name}</p>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-[#93a6c9]">
              {caption.place && <span>{caption.place}</span>}
              {caption.place && caption.year && <span>·</span>}
              {caption.year && <span className="text-[#c5d2ea]">{caption.year}</span>}
            </div>
            {clickHint && (
              <p className="mt-2 text-[9px] font-mono tracking-widest text-[#6aa4ff] uppercase border-t border-white/10 pt-1.5">
                {clickHint} →
              </p>
            )}
          </div>
        </Html>
      )}

      {/* Selected Specimen Card */}
      {labelReady && selected && (
        <Html position={[0, 0.05, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-max max-w-56 rounded-2xl border border-[#6aa4ff]/50 bg-[#070d1c]/95 p-3 text-left shadow-2xl backdrop-blur-xl ring-1 ring-[#6aa4ff]/30">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: signalColor, boxShadow: `0 0 10px ${signalColor}` }} />
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#6aa4ff]">TARGET LOCKED</span>
            </div>
            <p className="truncate font-display text-base font-semibold text-[#f4f7ff] uppercase tracking-wide leading-tight">{name}</p>
            <p className="mt-1 font-mono text-[10px] text-[#c5d2ea]">
              {caption.type} {caption.place ? `· ${caption.place}` : ""} {caption.year ? `· ${caption.year}` : ""}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

type Cluster = { id: string; objectIds: string[]; position: THREE.Vector3 };

/** Clusters only artifacts that are physically co-located at the same historical landing site (~25km). */
function clusterMarkers(objects: Artifact[]): Cluster[] {
  // Angular distance threshold on unit sphere: ~25 km on Moon / ~50 km on Mars
  const CO_LOCATION_THRESHOLD_SQ = 0.016 * 0.016;

  const positions = objects.map((object) => {
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  });

  const parent = objects.map((_, index) => index);
  const find = (index: number): number => {
    let cursor = index;
    while (parent[cursor] !== cursor) cursor = parent[cursor];
    return cursor;
  };

  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      if (positions[i].distanceToSquared(positions[j]) < CO_LOCATION_THRESHOLD_SQ) {
        parent[find(j)] = find(i);
      }
    }
  }

  const groups = new Map<number, { object: Artifact; position: THREE.Vector3 }[]>();
  objects.forEach((object, index) => {
    const root = find(index);
    const group = groups.get(root) ?? [];
    group.push({ object, position: positions[index] });
    groups.set(root, group);
  });

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const position = group.reduce((sum, item) => sum.add(item.position), new THREE.Vector3());
      position.multiplyScalar(1 / group.length).normalize().multiplyScalar(MARKER_ALTITUDE);
      return {
        id: group.map((item) => item.object.id).sort().join("|"),
        objectIds: group.map((item) => item.object.id),
        position,
      };
    });
}

function sameIds(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

/** Luminous laser tether line connecting landing anchor to bloomed hardware position. */
function ClusterTether({
  from,
  to,
  color,
  opacity = 0.5,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity?: number;
}) {
  const { mid, length, quaternion } = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const length = from.distanceTo(to);
    const dir = to.clone().sub(from).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { mid, length, quaternion };
  }, [from, to]);

  if (length < 0.002) return null;

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.0003, 0.0003, length, 6, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Resolves an authoritative landing site name for a multi-artifact cluster. */
function getClusterSiteName(objectIds: string[], byId: Map<string, Artifact>): string {
  const items = objectIds.map((id) => byId.get(id)).filter((item): item is Artifact => Boolean(item));
  if (items.length === 0) return "";

  const names = items.map((item) => item.location.locationName).filter(Boolean);
  if (names.length > 0) {
    // Prefer landmark landing sites / bases
    const landmark = names.find((name) =>
      /base|landing|station|memorial|crater|highlands|hadley|taurus|fra mauro/i.test(name)
    );
    if (landmark) return landmark;

    const counts = new Map<string, number>();
    for (const name of names) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    let topName = names[0];
    let topCount = 0;
    for (const [name, count] of counts.entries()) {
      if (count > topCount) {
        topCount = count;
        topName = name;
      }
    }
    return topName;
  }

  const missions = new Set(items.map((item) => item.missionId).filter(Boolean));
  if (missions.size === 1) {
    const missionId = [...missions][0];
    const formatted = missionId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `${formatted} Site`;
  }

  return items[0].location.region || "";
}

/** Radial Constellation Bloom: displays clustered hardware individually along tactical tethers. */
function ConstellationCluster({
  cluster,
  byId,
  siteName,
  isOpen,
  selectedId,
  previewedId,
  emphasisNonce,
  reducedMotion,
  quiet,
  skipEmpty,
  clickHint,
  pulses,
  labelFor,
  captionFor,
  onSelect,
  onOpen,
  onClose,
}: {
  cluster: Cluster;
  byId: Map<string, Artifact>;
  siteName: string;
  isOpen: boolean;
  selectedId: string | null;
  previewedId?: string | null;
  emphasisNonce: number;
  reducedMotion: boolean;
  quiet: boolean;
  skipEmpty: { current: boolean };
  clickHint?: string;
  pulses: Record<string, number>;
  labelFor: (object: Artifact) => string;
  captionFor: (object: Artifact) => { type: string; place: string; year: string };
  onSelect: (id: string) => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const emptyCaption = { type: "", place: "", year: "" };
  const anchorRef = useRef<THREE.Group>(null);
  const scratch = useRef(new THREE.Vector3());
  const [hot, setHot] = useState(false);
  const [labelReady, setLabelReady] = useState(false);
  useEffect(() => setLabelReady(true), []);

  const anchorRingQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cluster.position.clone().normalize()),
    [cluster.position]
  );
  const beamQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), cluster.position.clone().normalize()),
    [cluster.position]
  );

  // Dynamically keep anchor reticle scaled to the exact same proportion as individual markers
  useFrame(({ camera }) => {
    if (!anchorRef.current) return;
    const distance = camera.position.distanceTo(anchorRef.current.getWorldPosition(scratch.current));
    const scale = THREE.MathUtils.clamp(distance * 0.009, 0.0065, 0.022);
    anchorRef.current.scale.setScalar(scale);
  });

  const bloomLayout = useMemo(() => {
    const normal = cluster.position.clone().normalize();
    const up = Math.abs(normal.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangentU = new THREE.Vector3().crossVectors(up, normal).normalize();
    const tangentV = new THREE.Vector3().crossVectors(normal, tangentU).normalize();

    const count = cluster.objectIds.length;
    // Calibrated subtle bloom radius: ~35px to 45px separation on screen at close inspection
    const radius = count === 2 ? 0.032 : count === 3 ? 0.038 : 0.046;

    return cluster.objectIds.map((id, index) => {
      const angle =
        count === 2 ? (index === 0 ? -Math.PI / 2 : Math.PI / 2) : (index * 2 * Math.PI) / count - Math.PI / 2;

      const offset = tangentU
        .clone()
        .multiplyScalar(Math.cos(angle) * radius)
        .addScaledVector(tangentV, Math.sin(angle) * radius);

      const position = cluster.position.clone().add(offset).normalize().multiplyScalar(MARKER_ALTITUDE);
      return { id, position };
    });
  }, [cluster.position, cluster.objectIds]);

  if (!isOpen) {
    return (
      <group position={cluster.position}>
        {/* Pure 3D multi-artifact beacon marker */}
        <group ref={anchorRef}>
          {/* Ground primary radar reticle */}
          <mesh quaternion={anchorRingQuat}>
            <ringGeometry args={[1.05, 1.3, 36]} />
            <meshBasicMaterial color="#6aa4ff" transparent opacity={hot ? 0.9 : 0.65} depthWrite={false} toneMapped={false} />
          </mesh>

          {/* Secondary concentric multi-hardware beacon ring */}
          <mesh quaternion={anchorRingQuat}>
            <ringGeometry args={[1.5, 1.74, 36]} />
            <meshBasicMaterial color="#6aa4ff" transparent opacity={hot ? 0.55 : 0.32} depthWrite={false} toneMapped={false} />
          </mesh>

          {/* Vertical beacon anchor pillar */}
          <group quaternion={beamQuat}>
            <mesh position={[0, hot ? 1.6 : 1.15, 0]}>
              <cylinderGeometry args={[0.025, 0.065, hot ? 3.2 : 2.3, 8, 1, true]} />
              <meshBasicMaterial color="#6aa4ff" transparent opacity={0.55} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* High-visibility beacon tip star orb with brilliant white core */}
            <mesh position={[0, hot ? 3.25 : 2.35, 0]}>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <mesh position={[0, hot ? 3.25 : 2.35, 0]}>
              <sphereGeometry args={[0.28, 12, 12]} />
              <meshBasicMaterial color="#6aa4ff" transparent opacity={0.85} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>

          {/* Interactive base core sphere */}
          <mesh
            onPointerDown={(event) => {
              event.stopPropagation();
              skipEmpty.current = true;
            }}
            onClick={(event) => {
              event.stopPropagation();
              skipEmpty.current = true;
              onOpen();
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
              setHot(true);
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
              setHot(false);
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#6aa4ff" emissive="#6aa4ff" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>

          {/* Inner dark contrast core */}
          <mesh scale={0.58}>
            <sphereGeometry args={[1, 14, 14]} />
            <meshBasicMaterial color="#080e1c" toneMapped={false} />
          </mesh>
        </group>

        {/* Hover-only Archival Specimen Card (zero permanent text on the planet) */}
        {labelReady && hot && (
          <Html position={[0, 0.05, 0]} center zIndexRange={[14, 0]} style={{ pointerEvents: "none" }}>
            <div className="w-max max-w-56 rounded-2xl border border-[#6aa4ff]/40 bg-[#070d1c]/95 p-3 text-left shadow-2xl backdrop-blur-xl ring-1 ring-black/40">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6aa4ff] shadow-[0_0_8px_#6aa4ff]" />
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#6aa4ff]">
                  MULTI-ARTIFACT SITE · {cluster.objectIds.length} SITES
                </span>
              </div>
              <p className="font-display text-sm font-semibold text-[#f4f7ff] uppercase tracking-wide leading-tight">
                {siteName || `${cluster.objectIds.length} SITES`}
              </p>
              <p className="mt-2 text-[9px] font-mono tracking-widest text-[#6aa4ff] uppercase border-t border-white/10 pt-1.5">
                CLICK TO EXPAND SITE →
              </p>
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <>
      {/* Central landing origin hub */}
      <group position={cluster.position}>
        <group ref={anchorRef}>
          <mesh quaternion={anchorRingQuat}>
            <ringGeometry args={[1.05, 1.25, 32]} />
            <meshBasicMaterial color="#6aa4ff" transparent opacity={0.7} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh quaternion={anchorRingQuat}>
            <ringGeometry args={[1.5, 1.62, 32]} />
            <meshBasicMaterial color="#6aa4ff" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshBasicMaterial color="#6aa4ff" toneMapped={false} />
          </mesh>
        </group>
        {/* Subtle center hub collapse button only on hover */}
        {labelReady && (
          <Html position={[0, 0.02, 0]} center zIndexRange={[22, 0]} style={{ pointerEvents: "auto" }}>
            <div onPointerDown={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  skipEmpty.current = true;
                  onClose();
                }}
                className="group flex items-center gap-1 rounded-full border border-white/20 bg-[#070d1c]/90 px-2 py-0.5 text-[9px] font-mono text-[#93a6c9] shadow-lg backdrop-blur-md transition hover:border-[#6aa4ff] hover:text-[#f4f7ff]"
                title="Collapse site constellation"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#6aa4ff]" />
                <span className="text-[8px] text-[#6aa4ff]">COLLAPSE ✕</span>
              </button>
            </div>
          </Html>
        )}
      </group>

      {/* Luminous laser tethers from center origin to bloomed items */}
      {bloomLayout.map(({ id, position }) => (
        <ClusterTether
          key={`tether-${id}`}
          from={cluster.position}
          to={position}
          color={selectedId === id ? "#6aa4ff" : "#4a7ec4"}
          opacity={selectedId === id ? 0.75 : 0.35}
        />
      ))}

      {/* Individual Bloomed Markers */}
      {bloomLayout.map(({ id, position }) => {
        const object = byId.get(id);
        if (!object) return null;
        return (
          <Marker
            key={object.id}
            object={object}
            name={labelFor(object)}
            caption={captionFor(object) ?? emptyCaption}
            clickHint={clickHint}
            selected={object.id === selectedId}
            previewed={object.id === previewedId}
            emphasisNonce={emphasisNonce}
            revealAt={pulses[object.id] ?? 0}
            reducedMotion={reducedMotion}
            quiet={quiet}
            skipEmpty={skipEmpty}
            customPosition={position}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

function MarkerLayer({
  objects,
  selectedId,
  previewedId,
  emphasisNonce,
  reducedMotion,
  skipEmpty,
  spinAngle,
  clickHint,
  labelFor,
  captionFor,
  discovery,
  discoveredIds,
  onDiscover,
  onView,
  missionIds,
  onClusterFocus,
  onSelect,
}: {
  objects: Artifact[];
  selectedId: string | null;
  previewedId?: string | null;
  emphasisNonce: number;
  reducedMotion: boolean;
  skipEmpty: { current: boolean };
  spinAngle: { current: number };
  clusterHint: string;
  clickHint?: string;
  labelFor: (object: Artifact) => string;
  captionFor: (object: Artifact) => { type: string; place: string; year: string };
  discovery: boolean;
  discoveredIds: readonly string[];
  onDiscover: (ids: string[]) => void;
  onView?: (view: SurfaceView) => void;
  missionIds: readonly string[];
  onClusterFocus?: (position: THREE.Vector3) => void;
  onSelect: (id: string) => void;
}) {
  const { camera } = useThree();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [shown, setShown] = useState<string[]>(() => {
    if (!discovery) return objects.map((object) => object.id);
    const ids = new Set(discoveredIds);
    if (selectedId) ids.add(selectedId);
    return [...ids];
  });
  const [pulses, setPulses] = useState<Record<string, number>>({});
  const signature = useRef("");
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const last = useRef(0);
  const viewKey = useRef("");
  const byId = useMemo(() => new Map(objects.map((object) => [object.id, object])), [objects]);
  const known = useMemo(() => new Set(discoveredIds), [discoveredIds]);
  const onDiscoverRef = useRef(onDiscover);
  onDiscoverRef.current = onDiscover;
  const onViewRef = useRef(onView);
  onViewRef.current = onView;
  const emptyCaption = { type: "", place: "", year: "" };
  const disposed = useRef(false);
  useEffect(
    () => () => {
      disposed.current = true;
    },
    [],
  );
  // drei's HTML labels unmount their own React root. Doing that inside useFrame hits
  // "synchronously unmount a root while React was already rendering."
  const afterFrame = (apply: () => void) => {
    queueMicrotask(() => {
      if (!disposed.current) apply();
    });
  };

  useEffect(() => {
    if (!discovery) setShown(objects.map((object) => object.id));
  }, [discovery, objects]);

  useEffect(() => {
    if (selectedId) {
      const match = clusters.find((cluster) => cluster.objectIds.includes(selectedId));
      if (match) {
        setOpenId(match.id);
      }
    }
  }, [selectedId, clusters]);

  useFrame((state) => {
    if (state.clock.elapsedTime - last.current < 0.22) return;
    last.current = state.clock.elapsedTime;
    const distance = camera.position.length();
    const angle = discoveryAngle(distance);
    const threshold = angle === null ? 1 : Math.cos(angle);
    const visibleIds: string[] = [];
    const fresh: { id: string; facing: number }[] = [];
    let inView = 0;
    for (const object of objects) {
      const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
      const world = applySpin(new THREE.Vector3(vector.x, vector.y, vector.z), spinAngle.current).normalize();
      const facing = world.dot(camera.position.clone().normalize());
      const inside = angle !== null && facing > threshold;
      if (inside) inView += 1;
      const selected = object.id === selectedId;
      const previewed = object.id === previewedId;
      const remembered = known.has(object.id);
      const inMission = missionIds.includes(object.id);
      if (!discovery || selected || previewed || remembered || inside || inMission) visibleIds.push(object.id);
      if (discovery && inside && !selected && !remembered && !shownRef.current.includes(object.id)) {
        fresh.push({ id: object.id, facing });
      }
    }
    if (fresh.length > 0) {
      fresh.sort((a, b) => b.facing - a.facing);
      const ids = fresh.map((item) => item.id);
      const now = performance.now();
      afterFrame(() => {
        setPulses((current) => {
          const next = { ...current };
          for (const id of ids) next[id] = now;
          return next;
        });
        onDiscoverRef.current(ids);
      });
    }
    if (!sameIds(shownRef.current, visibleIds)) {
      const ids = visibleIds;
      afterFrame(() => setShown(ids));
    }

    const level = viewLevel(distance, Boolean(selectedId));
    const direction = camera.position.clone().normalize();
    const cos = Math.cos(spinAngle.current);
    const sin = Math.sin(spinAngle.current);
    const place = vectorToLatLon(direction.x * cos - direction.z * sin, direction.y, direction.x * sin + direction.z * cos);
    const key = `${level}:${inView}:${Math.round(place.latitude)}:${Math.round(place.longitude)}`;
    if (key !== viewKey.current) {
      viewKey.current = key;
      const view = { level, distance, inView, latitude: place.latitude, longitude: place.longitude };
      afterFrame(() => onViewRef.current?.(view));
    }

    const clusterable = objects.filter((object) => visibleIds.includes(object.id));
    const next = clusterMarkers(clusterable);
    const clusterKey = next.map((cluster) => cluster.id).join(";");
    if (clusterKey !== signature.current) {
      signature.current = clusterKey;
      afterFrame(() => {
        setClusters(next);
        setOpenId((current) => (next.some((cluster) => cluster.id === current) ? current : null));
      });
    }
  });

  const clusteredIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cluster of clusters) {
      for (const id of cluster.objectIds) {
        ids.add(id);
      }
    }
    return ids;
  }, [clusters]);

  const shownObjects = objects.filter((object) => shown.includes(object.id) && !clusteredIds.has(object.id));

  return (
    <>
      {shownObjects.map((object) => (
        <Marker
          key={object.id}
          object={object}
          name={labelFor(object)}
          caption={captionFor(object) ?? emptyCaption}
          clickHint={clickHint}
          selected={object.id === selectedId}
          previewed={object.id === previewedId}
          emphasisNonce={emphasisNonce}
          revealAt={pulses[object.id] ?? 0}
          reducedMotion={reducedMotion}
          quiet={missionIds.length > 0 && !missionIds.includes(object.id)}
          skipEmpty={skipEmpty}
          onSelect={onSelect}
        />
      ))}
      {clusters.map((cluster) => (
        <ConstellationCluster
          key={cluster.id}
          cluster={cluster}
          byId={byId}
          siteName={getClusterSiteName(cluster.objectIds, byId)}
          isOpen={openId === cluster.id || (selectedId !== null && cluster.objectIds.includes(selectedId))}
          selectedId={selectedId}
          previewedId={previewedId}
          emphasisNonce={emphasisNonce}
          reducedMotion={reducedMotion}
          quiet={missionIds.length > 0 && !cluster.objectIds.some((id) => missionIds.includes(id))}
          skipEmpty={skipEmpty}
          clickHint={clickHint}
          pulses={pulses}
          labelFor={labelFor}
          captionFor={captionFor}
          onSelect={onSelect}
          onOpen={() => {
            setOpenId(cluster.id);
            onClusterFocus?.(cluster.position);
          }}
          onClose={() => setOpenId(null)}
        />
      ))}
    </>
  );
}

function SpinningBody({
  angle,
  gate,
  children,
}: {
  angle: { current: number };
  gate: { current: boolean };
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.rotation.y = angle.current;
  });
  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;
    if (gate.current) angle.current += delta * VIEW_TURN;
    group.rotation.y = angle.current;
  });
  return <group ref={ref}>{children}</group>;
}

function SurfaceLoader({ label, reducedMotion, onComplete }: { label: string; reducedMotion: boolean; onComplete?: () => void }) {
  const { active, progress } = useProgress();
  const completed = useRef(false);
  useEffect(() => {
    if (active) {
      completed.current = true;
      return;
    }
    if (completed.current) {
      completed.current = false;
      onComplete?.();
    }
  }, [active, onComplete]);

  if (!active) return null;

  const currentPercent = Math.min(100, Math.max(0, Math.round(progress)));

  let stageText = "ACQUIRING ORBITAL TELEMETRY";
  if (currentPercent >= 85) {
    stageText = "SYNCHRONIZING HISTORICAL ARTIFACT ATLAS";
  } else if (currentPercent >= 55) {
    stageText = "RECONSTRUCTING SURFACE TOPOGRAPHY & SITES";
  } else if (currentPercent >= 25) {
    stageText = "CALIBRATING HIGH-RESOLUTION PLANETARY MAPPING";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-50 grid place-items-center overflow-hidden bg-[#050914] px-6 select-none"
    >
      {/* Deep cosmic ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,126,255,0.12)_0%,rgba(7,13,28,0.7)_50%,#050914_100%)] pointer-events-none" />
      <div className="surface-preloader-glow absolute h-[min(80vw,36rem)] w-[min(80vw,36rem)] rounded-full bg-[#3d7eff]/10 blur-[90px]" aria-hidden="true" />
      <div className="absolute h-96 w-96 rounded-full bg-[#f2a64a]/5 blur-[100px]" aria-hidden="true" />

      {/* Decorative celestial grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#6aa4ff_1px,transparent_1px),linear-gradient(to_bottom,#6aa4ff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        {/* Top telemetry pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#6aa4ff]/30 bg-[#0c162e]/80 px-3.5 py-1.5 shadow-[0_0_18px_rgba(106,164,255,0.18)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-[#6aa4ff] ${reducedMotion ? "" : "animate-ping opacity-75"}`} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6aa4ff]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.24em] text-[#c5d2ea] uppercase">
            {BRAND.CHALLENGE_SHORT}
          </span>
        </div>

        {/* Central Planetary Signal Radar Visualization */}
        <div className="relative my-7 flex h-52 w-52 sm:h-64 sm:w-64 items-center justify-center">
          {/* Outer compass coordinate ring */}
          <div
            className={`absolute inset-0 rounded-full border border-white/10 ${reducedMotion ? "" : "surface-preloader-orbit"}`}
            style={{ animationDuration: "36s" }}
            aria-hidden="true"
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#93a6c9] tracking-widest">N·00°</span>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#93a6c9] tracking-widest">S·180°</span>
            <span className="absolute top-1/2 -left-4 -translate-y-1/2 font-mono text-[9px] text-[#93a6c9] tracking-widest">W·270°</span>
            <span className="absolute top-1/2 -right-3.5 -translate-y-1/2 font-mono text-[9px] text-[#93a6c9] tracking-widest">E·90°</span>
          </div>

          {/* Secondary dashed telemetry ring */}
          <div
            className={`absolute inset-4 rounded-full border border-dashed border-[#6aa4ff]/25 ${reducedMotion ? "" : "surface-preloader-orbit-delayed"}`}
            style={{ animationDuration: "24s" }}
            aria-hidden="true"
          />

          {/* Radar sweep beam */}
          {!reducedMotion && (
            <div
              className="absolute inset-4 rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(106, 164, 255, 0.22) 360deg)",
                animation: "signal-radar-sweep 4s linear infinite",
              }}
              aria-hidden="true"
            />
          )}

          {/* Concentric signal ping pulses */}
          {!reducedMotion && (
            <>
              <div
                className="absolute inset-8 rounded-full border border-[#6aa4ff]/40 pointer-events-none"
                style={{ animation: "signal-ping-wave 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite" }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-8 rounded-full border border-[#f2a64a]/30 pointer-events-none"
                style={{ animation: "signal-ping-wave 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.4s" }}
                aria-hidden="true"
              />
            </>
          )}

          {/* Central Planetary Globe Core */}
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#101b38] via-[#091024] to-[#040816] shadow-[0_0_40px_rgba(61,126,255,0.35)] ring-1 ring-[#6aa4ff]/40">
            {/* Graticule latitude and longitude circles */}
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#6aa4ff]/30" />
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#6aa4ff]/30" />
            <div className="absolute inset-2 rounded-full border border-[#f2a64a]/20" />

            {/* Glowing signal beacon core */}
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span className={`absolute h-7 w-7 rounded-full bg-[#f2a64a]/25 ${reducedMotion ? "" : "animate-ping opacity-60"}`} />
              <span className="h-3 w-3 rounded-full bg-[#f2a64a] shadow-[0_0_14px_#f2a64a,0_0_24px_rgba(242,166,74,0.8)]" />
            </div>

            {/* Telemetry crosshair marks */}
            <div className="absolute -top-1 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-[#6aa4ff]/60" />
            <div className="absolute -bottom-1 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-[#6aa4ff]/60" />
            <div className="absolute -left-1 top-1/2 h-0.5 w-2 -translate-y-1/2 bg-[#6aa4ff]/60" />
            <div className="absolute -right-1 top-1/2 h-0.5 w-2 -translate-y-1/2 bg-[#6aa4ff]/60" />
          </div>
        </div>

        {/* Product Brand Header */}
        <h2 className="font-display text-3xl font-semibold tracking-wider text-[#f4f7ff] uppercase sm:text-4xl md:text-5xl leading-tight">
          {BRAND.PROJECT_DISPLAY_NAME}
        </h2>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-[#c5d2ea] leading-relaxed">
          {BRAND.PROJECT_SUBTITLE}
        </p>

        {/* Telemetry Stage & Carrier Wave Frequency */}
        <div className="mt-6 flex flex-col items-center gap-2">
          {/* Signal wave carrier bars */}
          <div className="flex items-center gap-1.5 h-4" aria-hidden="true">
            {[45, 80, 60, 95, 40, 75, 90, 50, 70].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-[#3d7eff] to-[#f2a64a]"
                style={{
                  height: `${h}%`,
                  animation: reducedMotion ? "none" : `telemetry-bar-pulse 1.2s ease-in-out infinite ${i * 120}ms`,
                }}
              />
            ))}
          </div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#6aa4ff] uppercase">
            {stageText}
          </p>
        </div>

        {/* High-Precision Progress Bar Gauge */}
        <div className="mt-4 w-full max-w-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#93a6c9] mb-1.5">
            <span className="tracking-widest uppercase">{label}</span>
            <span className="text-[#f4f7ff] font-semibold tracking-wider">{currentPercent}%</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3d7eff] via-[#6aa4ff] to-[#f2a64a] shadow-[0_0_12px_rgba(106,164,255,0.7)] transition-all duration-300 ease-out"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-[#7182a4] tracking-wider uppercase">
            <span>S-BAND CARRIER // 2287.5 MHz</span>
            <span>ANTENNA FIX ACQUIRED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionLinks({ ids, objects, reducedMotion }: { ids: readonly string[]; objects: Artifact[]; reducedMotion: boolean }) {
  const signature = ids
    .map((id) => {
      const object = objects.find((item) => item.id === id);
      return object ? `${object.id}:${object.location.latitude}:${object.location.longitude}` : "";
    })
    .join("|");
  const curves = useMemo(() => {
    const members = signature.split("|").filter(Boolean).flatMap((token) => {
      const [id, latitude, longitude] = token.split(":");
      if (!id || latitude === undefined || longitude === undefined) return [];
      return [{ id, latitude: Number(latitude), longitude: Number(longitude) }];
    });
    if (members.length < 2) return [];
    const hub = members[0];
    const onSurface = (latitude: number, longitude: number) => {
      const point = latLonToVector(latitude, longitude, 1.02);
      return new THREE.Vector3(point.x, point.y, point.z);
    };
    return members.slice(1).map((member) => {
      const from = onSurface(hub.latitude, hub.longitude);
      const to = onSurface(member.latitude, member.longitude);
      const outward = from.clone().add(to).normalize();
      const tangent = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0));
      if (tangent.lengthSq() < 1e-4) tangent.set(1, 0, 0);
      tangent.normalize();
      const span = Math.max(0.16, from.distanceTo(to));
      const steps = 12;
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= steps; step += 1) {
        const amount = step / steps;
        const bow = Math.sin(Math.PI * amount) * span * 0.45;
        const mixed = from.clone().lerp(to, amount);
        const length = mixed.length() || 1;
        mixed.multiplyScalar(1.02 / length).addScaledVector(tangent, bow).addScaledVector(outward, bow * 0.35);
        points.push(mixed);
      }
      return points;
    });
  }, [signature]);
  const mesh = useMemo(() => {
    if (curves.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: "#f2a64a", transparent: true, opacity: 0.9 });
    return new THREE.Mesh(geometry, material);
  }, [curves]);
  const drawn = useRef(0);

  useEffect(() => {
    drawn.current = reducedMotion ? 1 : 0;
  }, [mesh, reducedMotion]);

  useEffect(() => {
    if (!mesh) return;
    const material = mesh.material;
    return () => {
      mesh.geometry.dispose();
      if (!Array.isArray(material)) material.dispose();
    };
  }, [mesh]);

  useFrame((_, delta) => {
    if (!mesh || curves.length === 0) return;
    if (!reducedMotion && drawn.current < 1) drawn.current = Math.min(1, drawn.current + delta * 0.8);
    if (mesh.userData.drawn === drawn.current) return;
    mesh.userData.drawn = drawn.current;
    const positions: number[] = [];
    const indices: number[] = [];
    for (const points of curves) {
      const count = Math.max(2, Math.ceil(drawn.current * (points.length - 1)) + 1);
      const slice = points.slice(0, count);
      if (slice.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(slice);
      const tube = new THREE.TubeGeometry(curve, Math.max(2, slice.length * 2), 0.008, 5, false);
      const position = tube.getAttribute("position");
      const index = tube.getIndex();
      const offset = positions.length / 3;
      for (let item = 0; item < position.count; item += 1) {
        positions.push(position.getX(item), position.getY(item), position.getZ(item));
      }
      if (index) {
        for (let item = 0; item < index.count; item += 1) indices.push(index.getX(item) + offset);
      }
      tube.dispose();
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    next.setIndex(indices);
    next.computeVertexNormals();
    mesh.geometry.dispose();
    mesh.geometry = next;
  });

  if (!mesh) return null;
  return <primitive object={mesh} />;
}

function RoverTrail({ selectedId, reducedMotion }: { selectedId: string | null; reducedMotion: boolean }) {
  const route = roverRoutes.find((item) => item.roverId === selectedId && item.points.length > 1);
  const geometry = useMemo(() => {
    if (!route) return null;
    const flat: number[] = [];
    for (const point of route.points) {
      const vector = latLonToVector(point.latitude, point.longitude, 1.006);
      flat.push(vector.x, vector.y, vector.z);
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.Float32BufferAttribute(flat, 3));
    return next;
  }, [route]);
  const line = useMemo(() => {
    if (!geometry) return null;
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#8fd0ea", transparent: true, opacity: 0.75 }));
  }, [geometry]);
  const drawn = useRef(0);

  useEffect(() => {
    drawn.current = reducedMotion ? 1 : 0;
  }, [route, reducedMotion]);

  useEffect(() => {
    if (!line) return;
    const material = line.material;
    return () => {
      line.geometry.dispose();
      if (!Array.isArray(material)) material.dispose();
    };
  }, [line]);

  useFrame((_, delta) => {
    if (!geometry) return;
    const count = geometry.getAttribute("position").count;
    if (!reducedMotion) drawn.current = Math.min(1, drawn.current + delta * 0.4);
    geometry.setDrawRange(0, Math.max(1, Math.ceil(drawn.current * count)));
  });

  if (!line) return null;
  return <primitive object={line} />;
}

function SceneContents(props: SceneProps) {
  const selected = props.objects.find((object) => object.id === props.selectedId) ?? null;
  const skipEmpty = useRef(false);
  const spinAngle = useRef(0);
  const spinGate = useRef(false);
  const [clusterFocus, setClusterFocus] = useState<{ position: THREE.Vector3; nonce: number } | null>(null);
  const planetSeen = useRef(props.planet);
  if (planetSeen.current !== props.planet) {
    planetSeen.current = props.planet;
    spinAngle.current = 0;
  }
  return (
    <>
      <color attach="background" args={["#070d1c"]} />
      <StarField />
      <Lights planet={props.planet} />
      <CameraFill enabled={selected !== null} />
      <SpinningBody angle={spinAngle} gate={spinGate}>
        <TextureBoundary key={`${props.planet}-${props.textureAttempt ?? 0}`} onFail={props.onTextureFail} fallback={<FallbackSphere planet={props.planet} />}>
          <Suspense fallback={<FallbackSphere planet={props.planet} />}>
            <TexturedPlanet planet={props.planet} />
          </Suspense>
        </TextureBoundary>
        {props.planet === "mars" && <MarsAir />}
        {props.guideSite && (
          <GuideAstronaut
            latitude={props.guideSite.latitude}
            longitude={props.guideSite.longitude}
            reducedMotion={props.reducedMotion}
          />
        )}
        <MarkerLayer
          objects={props.objects}
          selectedId={props.selectedId}
          previewedId={props.previewedId}
          emphasisNonce={props.emphasisNonce}
          reducedMotion={props.reducedMotion}
          skipEmpty={skipEmpty}
          spinAngle={spinAngle}
          clusterHint={props.clusterHint}
          labelFor={props.labelFor}
          captionFor={props.captionFor ?? (() => ({ type: "", place: "", year: "" }))}
          discovery={props.discovery ?? false}
          discoveredIds={props.discoveredIds ?? []}
          onDiscover={props.onDiscover ?? (() => undefined)}
          onView={props.onView}
          missionIds={props.missionIds ?? []}
          onClusterFocus={(position) => setClusterFocus({ position, nonce: performance.now() })}
          onSelect={props.onSelect}
        />
        <MissionLinks ids={props.missionIds ?? []} objects={props.objects} reducedMotion={props.reducedMotion} />
        <RoverTrail selectedId={props.selectedId} reducedMotion={props.reducedMotion} />
      </SpinningBody>
      <CameraRig
        sceneRef={props.sceneRef}
        planet={props.planet}
        selected={selected}
        clusterFocus={clusterFocus}
        focusNonce={props.focusNonce}
        intro={props.intro}
        introDelay={props.introDelay}
        introReady={props.introReady}
        autoRotate={props.autoRotate}
        reducedMotion={props.reducedMotion}
        skipEmpty={skipEmpty}
        spinAngle={spinAngle}
        spinGate={spinGate}
        onEmptyClick={() => {
          setClusterFocus(null);
          props.onEmptyClick?.();
        }}
        onFlight={props.onFlight}
        siteFrame={props.siteFrame ?? { right: 0, up: 0 }}
      />
    </>
  );
}

export function PlanetViewport(props: SceneProps) {
  const fallback = (
    <PlainList objects={props.objects} message={props.errorMessage} labelFor={props.labelFor} onSelect={props.onSelect} />
  );
  const [supported] = useState(webglAvailable);
  const [textureAttempt, setTextureAttempt] = useState(0);
  const [textureFailed, setTextureFailed] = useState(false);
  useEffect(() => {
    setTextureFailed(false);
  }, [props.planet, textureAttempt]);
  if (!supported) return fallback;
  return (
    <WebglBoundary fallback={fallback}>
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [DEFAULT_OFFSET.x, DEFAULT_OFFSET.y, DEFAULT_OFFSET.z], fov: 42, near: 0.05, far: 280 }}
          dpr={[1, window.matchMedia("(max-width: 640px)").matches ? 1.25 : 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <SceneContents
            {...props}
            textureAttempt={textureAttempt}
            onTextureFail={() => setTextureFailed(true)}
          />
        </Canvas>
        <SurfaceLoader label={props.loadingLabel} reducedMotion={props.reducedMotion} onComplete={props.onSurfaceReady} />
        {textureFailed && (
          <div role="alert" className="absolute bottom-28 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-[#070d1c]/90 px-4 py-3 text-sm text-[#f4f7ff]">
            <p>{props.surfaceError}</p>
            <button type="button" className="min-h-11 rounded-full bg-[#3d7eff] px-3 text-sm" onClick={() => setTextureAttempt((value) => value + 1)}>
              {props.retryLabel}
            </button>
          </div>
        )}
      </div>
    </WebglBoundary>
  );
}
