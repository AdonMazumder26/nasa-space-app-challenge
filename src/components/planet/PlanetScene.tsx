import { OrbitControls, Stars, useProgress, useTexture, Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { latLonToVector, MARKER_ALTITUDE } from "../../lib/coordinates/latLon";
import { typeColor } from "../../lib/presentation";
import type { Artifact, PlanetId } from "../../types/catalog";

const MIN_DISTANCE = 1.42;
const MAX_DISTANCE = 5.8;
const DEFAULT_OFFSET = new THREE.Vector3(2.72, 0.5, 0.22);

const textureUrl: Record<PlanetId, string> = {
  moon: "/textures/moon.jpg",
  mars: "/textures/mars.jpg",
};

useTexture.preload(textureUrl.moon);
useTexture.preload(textureUrl.mars);

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
  autoRotate: boolean;
  reducedMotion: boolean;
  errorMessage: string;
  loadingLabel: string;
  clusterHint: string;
  labelFor: (object: Artifact) => string;
  onSelect: (id: string) => void;
  sceneRef: { current: SceneHandle | null };
};

class WebglBoundary extends Component<{ children: ReactNode; message: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-end p-6">
          <p className="max-w-sm rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-[#f3efe6]">{this.props.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
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
  const texture = useTexture(textureUrl[planet]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <mesh>
      <sphereGeometry args={[1, 96, 96]} />
      <meshStandardMaterial
        map={texture}
        bumpMap={texture}
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
            float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.4);
            gl_FragColor = vec4(glow, fresnel * 0.45);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh scale={1.065} material={material}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
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

type FocusAnim = { from: THREE.Vector3; to: THREE.Vector3; started: number };

function CameraRig({
  sceneRef,
  planet,
  selected,
  focusNonce,
  autoRotate,
  reducedMotion,
}: {
  sceneRef: { current: SceneHandle | null };
  planet: PlanetId;
  selected: Artifact | null;
  focusNonce: number;
  autoRotate: boolean;
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const controls = useRef<OrbitControlsImpl>(null);
  const focus = useRef<FocusAnim | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const idle = useRef<number | null>(null);

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

  useEffect(() => {
    camera.position.copy(DEFAULT_OFFSET);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    focus.current = null;
    setFocusing(false);
  }, [planet, camera]);

  useEffect(() => {
    if (!selected) return;
    const direction = latLonToVector(selected.location.latitude, selected.location.longitude, 1);
    const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
    const distance = THREE.MathUtils.clamp(camera.position.length(), MIN_DISTANCE, MAX_DISTANCE);
    const to = new THREE.Vector3(direction.x, direction.y, direction.z).multiplyScalar(distance / length);
    if (reducedMotion) {
      camera.position.copy(to);
      controls.current?.target.set(0, 0, 0);
      controls.current?.update();
      return;
    }
    focus.current = { from: camera.position.clone(), to, started: performance.now() };
    setFocusing(true);
  }, [selected, focusNonce, reducedMotion, camera]);

  useEffect(() => {
    const cancel = () => {
      focus.current = null;
      setFocusing(false);
    };
    gl.domElement.addEventListener("pointerdown", cancel);
    return () => gl.domElement.removeEventListener("pointerdown", cancel);
  }, [gl]);

  useFrame(() => {
    const anim = focus.current;
    if (!anim || !controls.current) return;
    const t = Math.min(1, (performance.now() - anim.started) / 880);
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
      autoRotate={autoRotate && !reducedMotion && !interacting && !focusing}
      autoRotateSpeed={0.32}
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
  selected,
  reducedMotion,
  onSelect,
}: {
  object: Artifact;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const position = useMemo(() => {
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }, [object.location.latitude, object.location.longitude]);
  const color = typeColor[object.type];

  useFrame(({ camera, clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const scale = THREE.MathUtils.clamp(camera.position.length() * 0.015, 0.015, 0.05) * (selected ? 1.45 : 1);
    mesh.scale.setScalar(scale);
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = selected && !reducedMotion ? 1.35 + Math.sin(clock.elapsedTime * 3.2) * 0.4 : selected ? 1.8 : 0.9;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(object.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
    </mesh>
  );
}

type Cluster = { id: string; objectIds: string[]; position: THREE.Vector3 };

function clusterMarkers(objects: Artifact[], camera: THREE.Camera, width: number, height: number): Cluster[] {
  const visible = objects.flatMap((object) => {
    const vector = latLonToVector(object.location.latitude, object.location.longitude, MARKER_ALTITUDE);
    const position = new THREE.Vector3(vector.x, vector.y, vector.z);
    const facing = position.clone().normalize().dot(camera.position.clone().normalize()) > 0.12;
    if (!facing) return [];
    const ndc = position.clone().project(camera);
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
  reducedMotion,
  clusterHint,
  labelFor,
  onSelect,
}: {
  objects: Artifact[];
  selectedId: string | null;
  reducedMotion: boolean;
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
    const next = clusterMarkers(objects, camera, size.width, size.height);
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
          selected={object.id === selectedId}
          reducedMotion={reducedMotion}
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
  return (
    <>
      <color attach="background" args={["#090b10"]} />
      <Stars radius={90} depth={40} count={reducedCount(props.reducedMotion)} factor={3} fade speed={props.reducedMotion ? 0 : 0.25} />
      <Lights planet={props.planet} />
      <TextureBoundary key={props.planet} fallback={<FallbackSphere planet={props.planet} />}>
        <Suspense fallback={<FallbackSphere planet={props.planet} />}>
          <TexturedPlanet planet={props.planet} />
        </Suspense>
      </TextureBoundary>
      {props.planet === "mars" && <MarsAir />}
      <MarkerLayer
        objects={props.objects}
        selectedId={props.selectedId}
        reducedMotion={props.reducedMotion}
        clusterHint={props.clusterHint}
        labelFor={props.labelFor}
        onSelect={props.onSelect}
      />
      <CameraRig
        sceneRef={props.sceneRef}
        planet={props.planet}
        selected={selected}
        focusNonce={props.focusNonce}
        autoRotate={props.autoRotate}
        reducedMotion={props.reducedMotion}
      />
    </>
  );
}

function reducedCount(reduced: boolean): number {
  return reduced ? 900 : 2200;
}

export function PlanetViewport(props: SceneProps) {
  return (
    <WebglBoundary message={props.errorMessage}>
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [DEFAULT_OFFSET.x, DEFAULT_OFFSET.y, DEFAULT_OFFSET.z], fov: 42, near: 0.05, far: 200 }}
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
