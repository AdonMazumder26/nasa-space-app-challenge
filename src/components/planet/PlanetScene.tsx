import { OrbitControls, useProgress, useTexture, Html } from "@react-three/drei";
import { StarField } from "./StarField";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { roverRoutes } from "../../data/roverRoutes";
import { latLonToVector, vectorToLatLon, MARKER_ALTITUDE } from "../../lib/coordinates/latLon";
import { discoveryAngle, viewLevel, type FlightPhase, type SurfaceView } from "../../lib/exploration";
import { typeColor } from "../../lib/presentation";
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
  focusNonce: number;
  emphasisNonce: number;
  intro: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  errorMessage: string;
  loadingLabel: string;
  clusterHint: string;
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

class TextureBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
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
  intro,
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
  intro: boolean;
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
  spinGate.current = autoRotate && !reducedMotion && !interacting && !focusing && !selected;

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
      focus.current = { from, to: home, started: performance.now(), selected: false };
      setFocusing(true);
      return;
    }
    focus.current = null;
    setFocusing(false);
    camera.position.copy(home);
    controls.current?.update();
  }, [planet, camera, intro, reducedMotion]);

  useLayoutEffect(() => {
    const home = DEFAULT_OFFSET.clone();
    if (!selected) {
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
    const direction = latLonToVector(selected.location.latitude, selected.location.longitude, 1);
    const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
    const radial = applySpin(new THREE.Vector3(direction.x, direction.y, direction.z).multiplyScalar(1 / length), spinAngle.current);
    const distance = 1.5;
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
  }, [selected, focusNonce, reducedMotion, camera, intro, spinAngle, siteFrame.right, siteFrame.up]);

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

function Marker({
  object,
  name,
  caption,
  selected,
  emphasisNonce,
  revealAt,
  reducedMotion,
  quiet,
  skipEmpty,
  onSelect,
}: {
  object: Artifact;
  name: string;
  caption: { type: string; place: string; year: string };
  selected: boolean;
  emphasisNonce: number;
  revealAt: number;
  reducedMotion: boolean;
  quiet: boolean;
  skipEmpty: { current: boolean };
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const rippleMat = useRef<THREE.MeshBasicMaterial>(null);
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
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }, [object.location.latitude, object.location.longitude]);
  const ringQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()), [position]);
  const color = typeColor[object.type];

  useFrame(({ camera, clock }) => {
    const mesh = group.current;
    if (!mesh) return;
    const age = (performance.now() - burst.current) / 700;
    const burstScale = !reducedMotion && age >= 0 && age < 1 ? 1 + Math.sin(age * Math.PI) * 0.55 : 1;
    const distance = camera.position.distanceTo(mesh.getWorldPosition(scratch.current));
    const distant = !selected && distance > 2.6 ? 0.72 : 1;
    const scale = THREE.MathUtils.clamp(distance * 0.018, 0.007, 0.036) * (selected ? 1.28 : hot ? 1.14 : 1) * burstScale * distant;
    mesh.scale.setScalar(scale);
    const material = mesh.children[0] && (mesh.children[0] as THREE.Mesh).material;
    if (material && !Array.isArray(material) && "emissiveIntensity" in material) {
      const glow = selected && !reducedMotion ? 1.2 + Math.sin(clock.elapsedTime * 3.2) * 0.28 : selected ? 1.6 : hot ? 1.15 : 0.75;
      material.emissiveIntensity = quiet && !selected ? glow * 0.2 : glow;
      if ("opacity" in material && "transparent" in material) {
        material.transparent = quiet && !selected;
        material.opacity = quiet && !selected ? 0.28 : 1;
      }
    }
    const revealAge = revealAt > 0 ? (performance.now() - revealAt) / 900 : 2;
    const rippling = !reducedMotion && revealAge >= 0 && revealAge < 1;
    if (ripple.current) ripple.current.visible = rippling;
    if (rippleMat.current) rippleMat.current.opacity = rippling ? 0.7 * (1 - revealAge) : 0;
    if (ripple.current && rippling) ripple.current.scale.setScalar(1 + revealAge * 2.4);
  });

  return (
    <group position={position}>
      <group ref={group}>
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
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={ripple} visible={false} quaternion={ringQuat}>
          <ringGeometry args={[1.35, 1.7, 40]} />
          <meshBasicMaterial ref={rippleMat} color={color} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        {selected && (
          <mesh quaternion={ringQuat}>
            <ringGeometry args={[1.55, 1.85, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>
      {labelReady && hot && !selected && (
        <Html position={[0, 0.045, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-max max-w-44 rounded-xl border border-white/15 bg-[#070d1c]/90 px-2.5 py-1.5 text-left shadow-lg">
            <p className="text-[11px] tracking-[0.14em] text-[#f4f7ff] uppercase">{name}</p>
            {caption.type && <p className="mt-0.5 text-[11px] text-[#c5d2ea]">{caption.type}</p>}
            {caption.place && <p className="text-[11px] text-[#93a6c9]">{caption.place}</p>}
            {caption.year && <p className="text-[11px] text-[#f2a64a]">{caption.year}</p>}
          </div>
        </Html>
      )}
      {labelReady && selected && (
        <Html position={[0, 0.045, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <span className="block max-w-44 truncate text-[11px] tracking-[0.12em] text-[#f4f7ff] uppercase">{name}</span>
        </Html>
      )}
    </group>
  );
}

type Cluster = { id: string; objectIds: string[]; position: THREE.Vector3 };

function clusterMarkers(objects: Artifact[], camera: THREE.Camera, width: number, height: number, yaw: number): Cluster[] {
  const visible = objects.flatMap((object) => {
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    const position = new THREE.Vector3(vector.x, vector.y, vector.z);
    const world = applySpin(position.clone(), yaw);
    const facing = world.clone().normalize().dot(camera.position.clone().normalize()) > 0.12;
    if (!facing) return [];
    const ndc = world.project(camera);
    return [{ object, position, x: (ndc.x * 0.5 + 0.5) * width, y: (-ndc.y * 0.5 + 0.5) * height }];
  });

  const parent = visible.map((_, index) => index);
  const find = (index: number): number => {
    let cursor = index;
    while (parent[cursor] !== cursor) cursor = parent[cursor];
    return cursor;
  };
  for (let i = 0; i < visible.length; i += 1) {
    for (let j = i + 1; j < visible.length; j += 1) {
      const dx = visible[i].x - visible[j].x;
      const dy = visible[i].y - visible[j].y;
      if (dx * dx + dy * dy < 34 * 34) parent[find(j)] = find(i);
    }
  }

  const groups = new Map<number, typeof visible>();
  visible.forEach((item, index) => {
    const root = find(index);
    const group = groups.get(root) ?? [];
    group.push(item);
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

function MarkerLayer({
  objects,
  selectedId,
  emphasisNonce,
  reducedMotion,
  skipEmpty,
  spinAngle,
  clusterHint,
  labelFor,
  captionFor,
  discovery,
  discoveredIds,
  onDiscover,
  onView,
  missionIds,
  onSelect,
}: {
  objects: Artifact[];
  selectedId: string | null;
  emphasisNonce: number;
  reducedMotion: boolean;
  skipEmpty: { current: boolean };
  spinAngle: { current: number };
  clusterHint: string;
  labelFor: (object: Artifact) => string;
  captionFor: (object: Artifact) => { type: string; place: string; year: string };
  discovery: boolean;
  discoveredIds: readonly string[];
  onDiscover: (ids: string[]) => void;
  onView?: (view: SurfaceView) => void;
  missionIds: readonly string[];
  onSelect: (id: string) => void;
}) {
  const { camera, size } = useThree();
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
      const remembered = known.has(object.id);
      const inMission = missionIds.includes(object.id);
      if (!discovery || selected || remembered || inside || inMission) visibleIds.push(object.id);
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

    const clusterable = objects.filter((object) => visibleIds.includes(object.id) && object.id !== selectedId);
    const next = clusterMarkers(clusterable, camera, size.width, size.height, spinAngle.current);
    const clusterKey = next.map((cluster) => cluster.id).join(";");
    if (clusterKey !== signature.current) {
      signature.current = clusterKey;
      afterFrame(() => {
        setClusters(next);
        setOpenId((current) => (next.some((cluster) => cluster.id === current) ? current : null));
      });
    }
  });

  const shownObjects = objects.filter((object) => shown.includes(object.id));

  return (
    <>
      {shownObjects.map((object) => (
        <Marker
          key={object.id}
          object={object}
          name={labelFor(object)}
          caption={captionFor(object) ?? emptyCaption}
          selected={object.id === selectedId}
          emphasisNonce={emphasisNonce}
          revealAt={pulses[object.id] ?? 0}
          reducedMotion={reducedMotion}
          quiet={missionIds.length > 0 && !missionIds.includes(object.id)}
          skipEmpty={skipEmpty}
          onSelect={onSelect}
        />
      ))}
      {clusters
        .filter((cluster) => {
          if (!selectedId) return true;
          const current = objects.find((object) => object.id === selectedId);
          if (!current) return true;
          const place = latLonToVector(current.location.latitude, current.location.longitude, MARKER_ALTITUDE);
          const gap = cluster.position.distanceTo(new THREE.Vector3(place.x, place.y, place.z));
          return gap > 0.03;
        })
        .map((cluster) => (
        <Html key={cluster.id} position={cluster.position} center zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
          <div onPointerDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="grid h-7 min-w-7 place-items-center rounded-full border border-white/30 bg-black/75 px-2 text-xs text-[#f4f7ff]"
              onClick={(event) => {
                event.stopPropagation();
                setOpenId((current) => (current === cluster.id ? null : cluster.id));
              }}
            >
              {cluster.objectIds.length}
            </button>
            {openId === cluster.id && (
              <div className="mt-2 w-52 rounded-xl border border-white/15 bg-[#10182e]/95 p-2 text-left shadow-xl">
                <p className="px-1 pb-1 text-[11px] leading-4 text-[#93a6c9]">{clusterHint}</p>
                <ul>
                  {cluster.objectIds.map((id) => {
                    const object = byId.get(id);
                    if (!object) return null;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/10"
                          onClick={() => {
                            setOpenId(null);
                            onSelect(id);
                          }}
                        >
                          {labelFor(object)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </Html>
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

function SurfaceLoader({ label }: { label: string }) {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs tracking-wide text-[#f4f7ff]">
      {label} {Math.round(progress)}%
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
        <TextureBoundary key={props.planet} fallback={<FallbackSphere planet={props.planet} />}>
          <Suspense fallback={<FallbackSphere planet={props.planet} />}>
            <TexturedPlanet planet={props.planet} />
          </Suspense>
        </TextureBoundary>
        {props.planet === "mars" && <MarsAir />}
        <MarkerLayer
          objects={props.objects}
          selectedId={props.selectedId}
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
          onSelect={props.onSelect}
        />
        <MissionLinks ids={props.missionIds ?? []} objects={props.objects} reducedMotion={props.reducedMotion} />
        <RoverTrail selectedId={props.selectedId} reducedMotion={props.reducedMotion} />
      </SpinningBody>
      <CameraRig
        sceneRef={props.sceneRef}
        planet={props.planet}
        selected={selected}
        focusNonce={props.focusNonce}
        intro={props.intro}
        autoRotate={props.autoRotate}
        reducedMotion={props.reducedMotion}
        skipEmpty={skipEmpty}
        spinAngle={spinAngle}
        spinGate={spinGate}
        onEmptyClick={props.onEmptyClick}
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
  if (!supported) return fallback;
  return (
    <WebglBoundary fallback={fallback}>
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [DEFAULT_OFFSET.x, DEFAULT_OFFSET.y, DEFAULT_OFFSET.z], fov: 42, near: 0.05, far: 280 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <SceneContents {...props} />
        </Canvas>
        <SurfaceLoader label={props.loadingLabel} />
      </div>
    </WebglBoundary>
  );
}
