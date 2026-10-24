import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { StarField } from "../planet/StarField";
import { RelicModel } from "./RelicModel";

type StageProps = {
  url: string;
  /** Changes the camera's resting angle so consecutive exhibits are approached differently. */
  angleSeed: number;
  focus: boolean;
  spinning: boolean;
  reducedMotion: boolean;
  /** Screen-space shift of the relic as fractions of the viewport: +x moves it right, +y moves it up. */
  frame?: [number, number];
  /** Largest dimension of the relic in scene units. */
  fit?: number;
  onReady: (url: string) => void;
  onUserDrag?: () => void;
};

/** Shifts the projection so the orbit target lands off-centre, leaving room for page text. */
function ViewFrame({ frame }: { frame: [number, number] }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.setViewOffset(size.width, size.height, -frame[0] * size.width, frame[1] * size.height, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height, frame]);
  return null;
}

const RADIUS_WIDE = 4.6;
const RADIUS_FOCUS = 2.7;
const POLAR = 1.32;

function Dust({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 12;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return;
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let index = 0; index < array.length; index += 3) {
      array[index + 1] -= delta * 0.045;
      array[index] += Math.sin(t * 0.2 + index) * delta * 0.01;
      if (array[index + 1] < -3.5) array[index + 1] = 3.5;
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.022} color="#b7c8ea" transparent opacity={0.55} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Lights({ reducedMotion }: { reducedMotion: boolean }) {
  const sweep = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    if (!sweep.current || reducedMotion) return;
    const t = state.clock.elapsedTime * 0.18;
    sweep.current.position.set(Math.cos(t) * 5.5, 4.2 + Math.sin(t * 0.7) * 0.8, Math.sin(t) * 5.5);
  });
  return (
    <>
      <hemisphereLight args={["#c9d8f5", "#0a1326", 0.55]} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.6} color="#fff1dc" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 1.2, -3]} intensity={1.6} color="#7fb0ff" />
      <directionalLight position={[0, -2, 5]} intensity={0.5} color="#f2a64a" />
      <primitive object={target} position={[0, 0, 0]} />
      <spotLight ref={sweep} position={[5, 4.5, 0]} angle={0.55} penumbra={0.75} intensity={140} distance={14} color="#ffffff" target={target} />
    </>
  );
}

/** Smoothly re-aims the camera on exhibit change and handles the focus zoom. */
function CameraRig({ angleSeed, focus, controls, reducedMotion, center }: { angleSeed: number; focus: boolean; controls: React.RefObject<OrbitControlsImpl | null>; reducedMotion: boolean; center: THREE.Vector3 }) {
  const { camera } = useThree();
  const goal = useRef(new THREE.Vector3());
  const gliding = useRef(false);
  const glideT = useRef(0);
  const start = useRef(new THREE.Vector3());
  const lastSeed = useRef<number | null>(null);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const radius = focus ? RADIUS_FOCUS : RADIUS_WIDE;
    const first = lastSeed.current === null;
    const newExhibit = lastSeed.current !== angleSeed;
    lastSeed.current = angleSeed;
    if (newExhibit) {
      goal.current.setFromSphericalCoords(radius, POLAR, angleSeed * 0.9 + 0.5).add(center);
    } else {
      // Focus toggles only change distance; keep the angle the visitor chose.
      const spherical = new THREE.Spherical().setFromVector3(scratch.copy(camera.position).sub(center));
      spherical.radius = radius;
      goal.current.setFromSpherical(spherical).add(center);
    }
    if (first || reducedMotion) {
      camera.position.copy(goal.current);
      camera.lookAt(center);
      controls.current?.update();
      return;
    }
    start.current.copy(camera.position);
    glideT.current = 0;
    gliding.current = true;
  }, [angleSeed, focus, camera, reducedMotion, controls, center, scratch]);

  useFrame((_, delta) => {
    if (!gliding.current) return;
    glideT.current = Math.min(1, glideT.current + delta / 1.3);
    const t = 1 - Math.pow(1 - glideT.current, 3);
    camera.position.lerpVectors(start.current, goal.current, t);
    camera.lookAt(center);
    controls.current?.update();
    if (glideT.current >= 1) gliding.current = false;
  });

  useEffect(() => {
    const instance = controls.current;
    if (!instance) return;
    const stop = () => {
      gliding.current = false;
    };
    instance.addEventListener("start", stop);
    return () => instance.removeEventListener("start", stop);
  }, [controls]);

  return null;
}

export function RelicStage({ url, angleSeed, focus, spinning, reducedMotion, frame = [0, 0], fit = 2.05, onReady, onUserDrag }: StageProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [current, setCurrent] = useState(url);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const center = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    if (url === current) return;
    setOutgoing(current);
    setCurrent(url);
  }, [url, current]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.6, RADIUS_WIDE], fov: 34, near: 0.1, far: 200 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      onPointerDown={onUserDrag}
    >
      <color attach="background" args={["#05091a"]} />
      <StarField />
      <Lights reducedMotion={reducedMotion} />
      <Dust reducedMotion={reducedMotion} />
      <group position={center}>
        <ContactShadows position={[0, -fit * 0.65, 0]} opacity={0.6} scale={fit * 3.4} blur={2.6} far={fit * 1.6} color="#000000" frames={reducedMotion ? 1 : Infinity} />
        <mesh position={[0, -fit * 0.65 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[fit * 0.76, fit * 0.78, 96]} />
          <meshBasicMaterial color="#6aa4ff" transparent opacity={0.18} toneMapped={false} />
        </mesh>
        <Suspense fallback={null}>
          <RelicModel key={current} url={current} fit={fit} phase="in" reducedMotion={reducedMotion} onReady={() => onReady(current)} />
        </Suspense>
        {outgoing && (
          <Suspense fallback={null}>
            <RelicModel key={`out-${outgoing}`} url={outgoing} fit={fit} phase="out" reducedMotion={reducedMotion} onGone={() => setOutgoing(null)} />
          </Suspense>
        )}
      </group>
      <ViewFrame frame={frame} />
      <CameraRig angleSeed={angleSeed} focus={focus} controls={controls} reducedMotion={reducedMotion} center={center} />
      <OrbitControls
        ref={controls}
        target={center}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={spinning && !reducedMotion}
        autoRotateSpeed={0.55}
        minPolarAngle={0.5}
        maxPolarAngle={2.3}
        makeDefault
      />
    </Canvas>
  );
}
