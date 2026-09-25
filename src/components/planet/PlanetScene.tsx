import { OrbitControls, useProgress, useTexture, Html } from "@react-three/drei";
import { StarField } from "./StarField";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { latLonToVector, MARKER_ALTITUDE } from "../../lib/coordinates/latLon";
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
      <p className="max-w-prose rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-[#f3efe6]">{message}</p>
      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {objects.map((object) => (
          <li key={object.id}>
            <button
              type="button"
              onClick={() => onSelect(object.id)}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#090b10]/80 px-3 py-2 text-left text-sm text-[#f3efe6] hover:border-white/25"
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
        bumpScale={planet === "moon" ? 0.012 : 0.008}
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
            gl_FragColor = vec4(glow, fresnel * 0.62);
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
        <meshBasicMaterial color="#c46a52" transparent opacity={0.045} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

function Lights({ planet }: { planet: PlanetId }) {
  return (
    <>
      <ambientLight intensity={planet === "moon" ? 0.045 : 0.12} />
      <directionalLight position={[4.5, 2.2, 1.4]} intensity={planet === "moon" ? 2.55 : 1.75} color={planet === "moon" ? "#f7f3ea" : "#ffd2b8"} />
      <directionalLight position={[-3.5, -1.2, -2]} intensity={0.18} color="#9eb4cc" />
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

type FocusAnim = { from: THREE.Vector3; to: THREE.Vector3; started: number };

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
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const controls = useRef<OrbitControlsImpl>(null);
  const focus = useRef<FocusAnim | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [focusing, setFocusing] = useState(false);
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
      focus.current = { from, to: home, started: performance.now() };
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
        return;
      }
      focus.current = { from: camera.position.clone(), to: home, started: performance.now() };
      setFocusing(true);
      return;
    }
    const direction = latLonToVector(selected.location.latitude, selected.location.longitude, 1);
    const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
    const dir = applySpin(new THREE.Vector3(direction.x, direction.y, direction.z).multiplyScalar(1 / length), spinAngle.current);
    const distance = 1.58;
    const pole = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(dir, pole).normalize();
    const lift = new THREE.Vector3().crossVectors(side, dir).normalize();
    const to = dir.multiplyScalar(distance).addScaledVector(lift, distance * 0.1);
    if (reducedMotion) {
      camera.position.copy(to);
      controls.current?.target.set(0, 0, 0);
      controls.current?.update();
      return;
    }
    focus.current = { from: camera.position.clone(), to, started: performance.now() };
    setFocusing(true);
  }, [selected, focusNonce, reducedMotion, camera, intro, spinAngle]);

  const emptyClick = useRef(onEmptyClick);
  emptyClick.current = onEmptyClick;

  useEffect(() => {
    const cancel = () => {
      focus.current = null;
      setFocusing(false);
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
    const t = Math.min(1, (performance.now() - anim.started) / 1100);
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    camera.position.lerpVectors(anim.from, anim.to, eased);
    controls.current.target.set(0, 0, 0);
    controls.current.update();
    if (t >= 1) {
      focus.current = null;
      setFocusing(false);
    }
  });

  return (
    <OrbitControls
      ref={controls}
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
  selected,
  emphasisNonce,
  reducedMotion,
  skipEmpty,
  onSelect,
}: {
  object: Artifact;
  name: string;
  selected: boolean;
  emphasisNonce: number;
  reducedMotion: boolean;
  skipEmpty: { current: boolean };
  onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const scratch = useRef(new THREE.Vector3());
  const burst = useRef(0);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (selected && emphasisNonce > 0) burst.current = performance.now();
  }, [selected, emphasisNonce]);
  const position = useMemo(() => {
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }, [object.location.latitude, object.location.longitude]);
  const color = typeColor[object.type];

  useFrame(({ camera, clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const age = (performance.now() - burst.current) / 700;
    const burstScale = !reducedMotion && age >= 0 && age < 1 ? 1 + Math.sin(age * Math.PI) * 0.85 : 1;
    const distance = camera.position.distanceTo(mesh.getWorldPosition(scratch.current));
    const scale = THREE.MathUtils.clamp(distance * 0.02, 0.008, 0.042) * (selected ? 1.35 : 1) * burstScale;
    mesh.scale.setScalar(scale);
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = selected && !reducedMotion ? 1.35 + Math.sin(clock.elapsedTime * 3.2) * 0.4 : selected ? 1.8 : 0.9;
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
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
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {hot && !selected && (
        <Html position={[0, 0.06, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <span className="block max-w-40 truncate rounded-full border border-white/15 bg-black/80 px-2 py-1 text-[11px] text-[#f3efe6]">{name}</span>
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

function MarkerLayer({
  objects,
  selectedId,
  emphasisNonce,
  reducedMotion,
  skipEmpty,
  spinAngle,
  clusterHint,
  labelFor,
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
  onSelect: (id: string) => void;
}) {
  const { camera, size } = useThree();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const signature = useRef("");
  const last = useRef(0);
  const byId = useMemo(() => new Map(objects.map((object) => [object.id, object])), [objects]);

  useFrame((state) => {
    if (state.clock.elapsedTime - last.current < 0.25) return;
    last.current = state.clock.elapsedTime;
    const next = clusterMarkers(objects, camera, size.width, size.height, spinAngle.current);
    const key = next.map((cluster) => cluster.id).join(";");
    if (key !== signature.current) {
      signature.current = key;
      setClusters(next);
      setOpenId((current) => (next.some((cluster) => cluster.id === current) ? current : null));
    }
  });

  return (
    <>
      {objects.map((object) => (
        <Marker
          key={object.id}
          object={object}
          name={labelFor(object)}
          selected={object.id === selectedId}
          emphasisNonce={emphasisNonce}
          reducedMotion={reducedMotion}
          skipEmpty={skipEmpty}
          onSelect={onSelect}
        />
      ))}
      {clusters.map((cluster) => (
        <Html key={cluster.id} position={cluster.position} center zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
          <div onPointerDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="grid h-7 min-w-7 place-items-center rounded-full border border-white/30 bg-black/75 px-2 text-xs text-[#f3efe6]"
              onClick={(event) => {
                event.stopPropagation();
                setOpenId((current) => (current === cluster.id ? null : cluster.id));
              }}
            >
              {cluster.objectIds.length}
            </button>
            {openId === cluster.id && (
              <div className="mt-2 w-52 rounded-xl border border-white/15 bg-[#10131a]/95 p-2 text-left shadow-xl">
                <p className="px-1 pb-1 text-[11px] leading-4 text-[#b7b0a4]">{clusterHint}</p>
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
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs tracking-wide text-[#f3efe6]">
      {label} {Math.round(progress)}%
    </div>
  );
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
      <color attach="background" args={["#070910"]} />
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
          onSelect={props.onSelect}
        />
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
